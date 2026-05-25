export const searchPIs = async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value))
        }
    })
    const res = await fetch(`/api/pis?${params.toString()}`);
    const data = await res.json();
    return data.pis ?? [];
}
