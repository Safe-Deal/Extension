import type { Runtime } from "webextension-polyfill";
import browser from "webextension-polyfill";
import type { RequestMessage } from "./src/PortMessage";
import type { InternalPacket } from "./src/types-internal";
import type { DeliveryReceipt } from "./src/utils/delivery-logger";
import type { EndpointFingerprint } from "./src/utils/endpoint-fingerprint";

import { createBroadcastEventRuntime } from "./src/BroadcastEventRuntime";
import { createMessageRuntime } from "./src/MessageRuntime";
import { PortMessage } from "./src/PortMessage";
import { initTransportAPI } from "./src/TransportAPI";
import { InternalBroadcastEvent } from "./src/types-internal";
import { decodeConnectionArgs } from "./src/utils/connection-args";
import { createDeliveryLogger } from "./src/utils/delivery-logger";
import { createFingerprint } from "./src/utils/endpoint-fingerprint";
import { deserializeEndpoint, serializeEndpoint } from "./src/utils/endpoint-utils";
import { isPageWindowPacket } from "./src/utils/internalPacketTypeGuards";
import { internalPacketTypeRouter } from "./src/utils/internalPacketTypeRouter";

interface PortConnection {
  port: Runtime.Port;
  fingerprint: EndpointFingerprint;
}

export function initPegasusTransport(): void {
  const pendingResponses = createDeliveryLogger();
  // every content script in a frame connects as the same `content-script@tab.frame` endpoint, so one endpoint can hold several ports
  const connMap = new Map<string, PortConnection[]>();
  const packetSenders = new WeakMap<InternalPacket, EndpointFingerprint>();
  const requesters = new Map<string, EndpointFingerprint>();
  const oncePortConnectedCbs = new Map<string, Set<() => void>>();
  const onceSessionEndCbs = new Map<EndpointFingerprint, Set<() => void>>();

  const connectionOf = (endpoint: string, fingerprint: EndpointFingerprint | undefined) =>
    connMap.get(endpoint)?.find((conn) => conn.fingerprint === fingerprint);

  const latestConnectionOf = (endpoint: string) => {
    const connections = connMap.get(endpoint);
    return connections?.[connections.length - 1];
  };

  const addConnection = (endpoint: string, connection: PortConnection) => {
    const others = (connMap.get(endpoint) ?? []).filter((conn) => conn.fingerprint !== connection.fingerprint);
    connMap.set(endpoint, [...others, connection]);
  };

  const removeConnection = (endpoint: string, port: Runtime.Port) => {
    const remaining = (connMap.get(endpoint) ?? []).filter((conn) => conn.port !== port);
    if (remaining.length > 0) {
      connMap.set(endpoint, remaining);
    } else {
      connMap.delete(endpoint);
    }
  };

  const allConnections = () => ([] as PortConnection[]).concat(...connMap.values());

  const takeRequester = (transactionId: string) => {
    const requester = requesters.get(transactionId);
    requesters.delete(transactionId);
    return requester;
  };

  const oncePortConnected = (endpointName: string, cb: () => void) => {
    oncePortConnectedCbs.set(endpointName, (oncePortConnectedCbs.get(endpointName) || new Set()).add(cb));

    return () => {
      const su = oncePortConnectedCbs.get(endpointName);
      if (su?.delete(cb) && su?.size === 0) {
        oncePortConnectedCbs.delete(endpointName);
      }
    };
  };

  const onceSessionEnded = (sessionFingerprint: EndpointFingerprint, cb: () => void) => {
    onceSessionEndCbs.set(sessionFingerprint, (onceSessionEndCbs.get(sessionFingerprint) || new Set()).add(cb));
  };

  const notifyEndpoint = (endpoint: string) => ({
    withFingerprint: (fingerprint: EndpointFingerprint) => {
      const nextChain = <T>(v: T) => ({ and: () => v });

      const notifications = {
        aboutIncomingMessage: (message: InternalPacket) => {
          const recipient = connectionOf(endpoint, fingerprint);
          if (recipient == null) {
            throw new Error("Unable to find recipient endpoint");
          }

          PortMessage.toExtensionContext(recipient.port, {
            message,
            status: "incoming"
          });

          return nextChain(notifications);
        },

        aboutMessageUndeliverability: (resolvedDestination: string, message: InternalPacket) => {
          const sender = connectionOf(endpoint, fingerprint);
          if (sender) {
            PortMessage.toExtensionContext(sender.port, {
              message,
              resolvedDestination,
              status: "undeliverable"
            });
          }

          return nextChain(notifications);
        },

        aboutSessionEnded: (endedSessionFingerprint: EndpointFingerprint) => {
          const conn = connectionOf(endpoint, fingerprint);
          if (conn) {
            PortMessage.toExtensionContext(conn.port, {
              fingerprint: endedSessionFingerprint,
              status: "terminated"
            });
          }

          return nextChain(notifications);
        },

        aboutSuccessfulDelivery: (receipt: DeliveryReceipt) => {
          const sender = connectionOf(endpoint, fingerprint);
          if (sender == null) {
            throw new Error("Unable to find sender endpoint");
          }

          PortMessage.toExtensionContext(sender.port, {
            receipt,
            status: "delivered"
          });

          return nextChain(notifications);
        },

        whenDeliverableTo: (targetEndpoint: string) => {
          const notifyDeliverability = () => {
            const origin = connectionOf(endpoint, fingerprint);
            if (origin && connMap.has(targetEndpoint)) {
              PortMessage.toExtensionContext(origin.port, {
                deliverableTo: targetEndpoint,
                status: "deliverable"
              });

              return true;
            }
          };

          if (!notifyDeliverability()) {
            const unsub = oncePortConnected(targetEndpoint, notifyDeliverability);
            onceSessionEnded(fingerprint, unsub);
          }

          return nextChain(notifications);
        }
      };

      return notifications;
    }
  });

  const sessFingerprint = createFingerprint();

  const messageRuntime = createMessageRuntime(
    "background",
    async (message) => {
      if (
        message.origin.context === "background" &&
        ["content-script", "devtools"].includes(message.destination.context) &&
        !message.destination.tabId
      ) {
        throw new TypeError("When sending messages from background page, use @tabId syntax to target specific tab");
      }

      const resolvedSender = serializeEndpoint({
        ...message.origin,
        ...(message.origin.context === "window" && { context: "content-script" })
      });

      const resolvedDestination = serializeEndpoint({
        ...message.destination,
        ...(message.destination.context === "window" && {
          context: "content-script"
        }),
        tabId: message.destination.tabId || message.origin.tabId
      });

      // downstream endpoints are agnostic of these attributes, presence of these attrs will make them think the message is not intended for them
      message.destination.tabId = null;
      message.destination.frameId = undefined;

      const sender = connectionOf(resolvedSender, packetSenders.get(message));
      const recipient =
        message.messageType === "reply"
          ? connectionOf(resolvedDestination, takeRequester(message.transactionId))
          : latestConnectionOf(resolvedDestination);

      const deliver = (to: PortConnection) => {
        notifyEndpoint(resolvedDestination).withFingerprint(to.fingerprint).aboutIncomingMessage(message);

        const receipt: DeliveryReceipt = {
          from: {
            endpointId: resolvedSender,
            fingerprint: sender?.fingerprint
          },
          message,
          to: to.fingerprint
        };

        if (message.messageType === "message") {
          pendingResponses.add(receipt);
        }

        if (message.messageType === "reply") {
          pendingResponses.remove(message.id);
        }

        if (sender) {
          notifyEndpoint(resolvedSender).withFingerprint(sender.fingerprint).aboutSuccessfulDelivery(receipt);
        }
      };

      if (recipient) {
        deliver(recipient);
      } else if (message.messageType === "message") {
        if (message.origin.context === "background") {
          oncePortConnected(resolvedDestination, () => deliver(latestConnectionOf(resolvedDestination)));
        } else if (sender) {
          notifyEndpoint(resolvedSender)
            .withFingerprint(sender.fingerprint)
            .aboutMessageUndeliverability(resolvedDestination, message)
            .and()
            .whenDeliverableTo(resolvedDestination);
        }
      }
    },
    async (message) => {
      const resolvedSender = serializeEndpoint({
        ...message.origin,
        ...(message.origin.context === "window" && { context: "content-script" })
      });

      const sender = connectionOf(resolvedSender, packetSenders.get(message));
      if (sender == null) {
        throw new Error("Unable to find sender endpoint");
      }

      const receipt: DeliveryReceipt = {
        from: {
          endpointId: resolvedSender,
          fingerprint: sender.fingerprint
        },
        message,
        to: sessFingerprint
      };

      notifyEndpoint(resolvedSender).withFingerprint(sender.fingerprint).aboutSuccessfulDelivery(receipt);
    }
  );

  browser.runtime.onConnect.addListener((incomingPort) => {
    const connArgs = decodeConnectionArgs(incomingPort.name);

    if (!connArgs) {
      return;
    }

    // all other contexts except 'content-script' are aware of, and pass their identity as name
    connArgs.endpointName ||= serializeEndpoint({
      context: "content-script",
      frameId: incomingPort.sender?.frameId,
      tabId: incomingPort.sender?.tab?.id ?? null
    });

    // literal tab id in case of content script, however tab id of inspected page in case of devtools context
    const { tabId: linkedTabId, frameId: linkedFrameId } = deserializeEndpoint(connArgs.endpointName);

    addConnection(connArgs.endpointName, {
      fingerprint: connArgs.fingerprint,
      port: incomingPort
    });

    oncePortConnectedCbs.get(connArgs.endpointName)?.forEach((cb) => cb());
    oncePortConnectedCbs.delete(connArgs.endpointName);

    onceSessionEnded(connArgs.fingerprint, () => {
      const rogueMsgs = pendingResponses
        .entries()
        .filter((pendingMessage) => pendingMessage.to === connArgs.fingerprint);
      pendingResponses.remove(rogueMsgs);

      rogueMsgs.forEach((rogueMessage) => {
        if (rogueMessage.from.endpointId === "background") {
          messageRuntime.endTransaction(rogueMessage.message.transactionId);
        } else {
          notifyEndpoint(rogueMessage.from.endpointId)
            .withFingerprint(rogueMessage.from.fingerprint)
            .aboutSessionEnded(connArgs.fingerprint);
        }
      });
    });

    incomingPort.onDisconnect.addListener(() => {
      // sometimes previous content script's onDisconnect is called *after* the fresh content-script's
      // onConnect. So we remove only this port, never the fresh one
      removeConnection(connArgs.endpointName, incomingPort);
      requesters.forEach((fingerprint, transactionId) => {
        if (fingerprint === connArgs.fingerprint) {
          requesters.delete(transactionId);
        }
      });

      onceSessionEndCbs.get(connArgs.fingerprint)?.forEach((cb) => cb());
      onceSessionEndCbs.delete(connArgs.fingerprint);
    });

    incomingPort.onMessage.addListener((msg: RequestMessage) => {
      if (msg.type === "sync") {
        const allActiveSessions = allConnections().map((conn) => conn.fingerprint);
        const stillPending = msg.pendingResponses.filter((fp) => allActiveSessions.includes(fp.to));

        pendingResponses.add(...stillPending);

        msg.pendingResponses
          .filter((deliveryReceipt) => !allActiveSessions.includes(deliveryReceipt.to))
          .forEach((deliveryReceipt) =>
            notifyEndpoint(connArgs.endpointName)
              .withFingerprint(connArgs.fingerprint)
              .aboutSessionEnded(deliveryReceipt.to)
          );

        msg.pendingDeliveries.forEach((intendedDestination) =>
          notifyEndpoint(connArgs.endpointName)
            .withFingerprint(connArgs.fingerprint)
            .whenDeliverableTo(intendedDestination)
        );

        return;
      }

      if (msg.type === "deliver" && msg.message?.origin?.context) {
        // any page script can answer a content script's window port offer, so window packets are untrusted
        if (isPageWindowPacket(msg.message)) {
          console.debug(
            `[pegasus-transport] Dropped '${msg.message.id}' sent by a page window via ${connArgs.endpointName}`
          );
          return;
        }

        // origin tab ID is resolved from the port identifier (also prevent "MITM attacks" of extensions)
        msg.message.origin.tabId = linkedTabId;
        msg.message.origin.frameId = linkedFrameId;

        packetSenders.set(msg.message, connArgs.fingerprint);
        if (msg.message.messageType === "message") {
          requesters.set(msg.message.transactionId, connArgs.fingerprint);
        }

        internalPacketTypeRouter(msg.message, { eventRuntime, messageRuntime });
      }
    });
  });

  let undeliveredEvents: InternalBroadcastEvent[] | undefined = [];
  // PersistentPort usually reconnects within 500ms
  setTimeout(() => {
    Promise.all((undeliveredEvents as InternalBroadcastEvent[]).map(routeEvent)).catch((err) => {
      console.error("Error while tying to deliver undelivered events:", err);
    });
    undeliveredEvents = undefined;
  }, 500);

  const routeEvent = async (event: InternalBroadcastEvent) => {
    // Background SW just resumed it's work and there are no connections yet
    // so we need to queue the event for later delivery
    if (connMap.size === 0 && undeliveredEvents !== undefined) {
      undeliveredEvents.push(event);
      return;
    }

    connMap.forEach((connections, endpoint) => {
      connections.forEach((conn) =>
        notifyEndpoint(endpoint).withFingerprint(conn.fingerprint).aboutIncomingMessage(event)
      );
    });

    // So background listeners receive events from other contexts
    if (event.origin.context !== "background") {
      eventRuntime.handleEvent(event);
    }
  };

  const eventRuntime = createBroadcastEventRuntime("background", routeEvent);

  initTransportAPI({
    browser,
    emitBroadcastEvent: eventRuntime.emitBroadcastEvent,
    onBroadcastEvent: eventRuntime.onBroadcastEvent,
    onMessage: messageRuntime.onMessage,
    sendMessage: messageRuntime.sendMessage
  });
}
