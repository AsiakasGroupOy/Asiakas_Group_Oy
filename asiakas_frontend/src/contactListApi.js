//Fetching data from the backend API for CallView activated by Navigation tab, first contact in the contact_calling_list will be shown.
export const fetchByFirstFromConCallingList = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/first`
  );
  if (!response.ok)
    throw new Error("Failed to fetch data based on first contact in the List");
  return await response.json();
};


//Fetching data from the backend API for CallView activated by selected row in the Contact List view, contact with the coresponding contact_calling_list id will be shown.
export const fetchByNavIdFromConCallingList = async (concallIdFromNav) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/api/concalllist/${concallIdFromNav}/navid`
  );
  if (!response.ok)
    throw new Error("Failed to fetch data based on navId in the List");
  return await response.json();
};


//Fetching data from the backend API for CallView by the calling list name, first contact in the coresponding calling list name will be shown.
export const fetchByCallingListName = async (callingListName) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/api/concalllist/${callingListName}/calllistname`
  );
  if (!response.ok)
    throw new Error("Failed to fetch data based on calling list name");
  return await response.json();
};

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


// Fetching all organizations names for add contact form
export const fetchOrganizations = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/organizations/all`
  );
  if (!response.ok) throw new Error("Failed to fetch organizations");
  return await response.json();
};


// Fetching all calling lists names for add contact form
export const fetchCallLists = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/callinglist/all`
  );
  if (!response.ok) throw new Error("Failed to fetch Calling Lists");
  return await response.json();
};


//Fetching data for Contact list view with the last call status on contact_calling_list id
export const fullContactsCallLists = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/all`
  );
  if (!response.ok) throw new Error("Failed to fetch contacts from Call Lists");
  return await response.json();
};


export const removeContactsCallLists = async (contactIds) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/remove`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactIds),
    }
  );

  if (!response.ok)
    throw new Error("Failed to remove Contacts and Call Lists assosiations");
  return await response.json();
};


export const addNote = async (ccl_id, noteValue) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/${ccl_id}/note`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: noteValue }),
    }
  );

  if (!response.ok) throw new Error("Failed to add note");
  return await response.json();
};


export const addStatus = async (ccl_id, newStatus) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/calllogs/${ccl_id}/status`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }
  );

  if (!response.ok) throw new Error("Failed to add status");
  return await response.json();
};
