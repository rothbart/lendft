const PAGE_NAME_BORROW = "Borrow";
const PAGE_NAME_LEND = "Lend";
const PAGE_NAME_MANAGE = "Manage";

export const PAGE_ROUTE_BORROW = "/borrow";
export const PAGE_ROUTE_LEND = "/lend";
export const PAGE_ROUTE_MANAGE = "/manage";

interface PageInfoType {
    name: string;
    route: string;
}

interface SitePagesInfoType {
    [key: string]: PageInfoType
}

export const SITE_PAGES_INFO: SitePagesInfoType = {
    [PAGE_NAME_BORROW]: {
        name: PAGE_NAME_BORROW,
        route: PAGE_ROUTE_BORROW,
    },
    [PAGE_NAME_LEND]: {
        name: PAGE_NAME_LEND,
        route: PAGE_ROUTE_LEND,
    },
    [PAGE_NAME_MANAGE]: {
        name: PAGE_NAME_MANAGE,
        route: PAGE_ROUTE_MANAGE,
    }
}