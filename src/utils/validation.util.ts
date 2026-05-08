export function parseIdParam(idParam: string | string[] | undefined): number | null {
    const stringId = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!stringId) {
        return null;
    }

    const id = parseInt(stringId, 10);

    if (isNaN(id)) {
        return null;
    }

    return id;
}