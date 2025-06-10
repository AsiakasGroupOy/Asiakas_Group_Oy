

export const fetchByFirstFromConCallingList = async()=>{
  const response = await fetch ( `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/first` );
  if (!response.ok) throw new Error("Failed to fetch data based on first contact in the List");
  return await response.json(); 
}

export const fetchByNavIdFromConCallingList = async (concallIdFromNav)=>{
  const response = await fetch ( `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/${concallIdFromNav}/navid` );
  if (!response.ok) throw new Error("Failed to fetch data based on navId in the List");
  return await response.json();   
}

export const fetchByCallingListName = async (callingListName) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/concalllist/${callingListName}/calllistname` )
  if (!response.ok) throw new Error("Failed to fetch data based on calling list name");
  return await response.json();
}

export const addContact = async (newContact) => {
  const response = fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contacts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newContact),
  });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed to add contact");
    return data;
};

export const fetchOrganizations = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/organizations/all`
  );
  if (!response.ok) throw new Error("Failed to fetch organizations");
  return await response.json();
};

export const fetchCallLists = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/callinglist/all`
  );
  if (!response.ok) throw new Error("Failed to fetch Calling Lists");
  return await response.json();
};

export const fullContactsCallLists = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/all`
  );
  if (!response.ok) throw new Error("Failed to fetch contacts from Call Lists");  
  return await response.json();
};

export const removeContactsCallLists = async (contactIds) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/concalllist/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactIds),
    });

  if (!response.ok) throw new Error("Failed to remove Contacts and Call Lists assosiations");  
  return await response.json();
};

export const addNote = async (ccl_id, noteValue) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/concalllist/${ccl_id}/note`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({note:noteValue}),
  });

  if (!response.ok) throw new Error("Failed to add note");
  return await response.json();

}