import { ISiteSpec } from "../entities/site-spec.interface";
import { Rule } from "../rules/rule";
import { SiteDomSelector } from "./site-dom-selector";

export class Site {
  private readonly _url: string;

  private readonly _domain: string;

  private readonly _domainURL: string;

  private readonly _dom: any;

  private readonly _pathName: string;

  private readonly _queryParams: string;

  private readonly _siteDomSelector: SiteDomSelector;

  private _rules: Rule[];

  constructor(
    { url, domain, domainURL, dom, pathName, queryParams }: ISiteSpec,
    siteDomSelector: SiteDomSelector,
    rules?: Rule[]
  ) {
    this._url = url;
    this._domain = domain;
    this._domainURL = domainURL;
    this._dom = dom;
    this._pathName = pathName;
    this._queryParams = queryParams;
    this._siteDomSelector = siteDomSelector;
    this._rules = rules;
  }

  get url(): string {
    return this._url;
  }

  get domain(): string {
    return this._domain;
  }

  get domainURL(): string {
    return this._domainURL;
  }

  get dom(): any {
    return this._dom;
  }

  get pathName(): string {
    return this._pathName;
  }

  get queryParams(): string {
    return this._queryParams;
  }

  get siteDomSelector(): SiteDomSelector {
    return this._siteDomSelector;
  }

  get rules(): Rule[] {
    return this._rules;
  }

  public setRules(rules: Rule[]): void {
    this._rules = rules;
  }
}
