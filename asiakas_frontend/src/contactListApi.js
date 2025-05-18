export const getContactList = () => {
    return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contacts/all`)
                .then(response => {
                    if (!response.ok)
                        throw new Error("error in fetch: " + response.statusText);
                     console.log("response", response);
                    return response.json();
                    
                });
}