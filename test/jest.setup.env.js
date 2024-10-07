require("@testing-library/jest-dom");

const { userEvent } = require("@testing-library/user-event");
const integration = require("./jest.integration");

global.user = userEvent.setup();
global.it = integration.itWorks.bind(integration);
global.it.skip = test.skip;
