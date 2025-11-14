import { apiFetch, secureApiFetch } from "./apiFetch.js";

//Fetching data from the backend API for CallView activated by Navigation tab, first contact in the contact_calling_list will be shown.
export const fetchByFirstFromConCallingList = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/first`
  );
};

//Fetching data from the backend API for CallView activated by selected row in the Contact List view, contact with the coresponding contact_calling_list id will be shown.
export const fetchByNavIdFromConCallingList = async (concallIdFromNav) => {
  return await secureApiFetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/api/concalllist/${concallIdFromNav}/navid`
  );
};

//Fetching data from the backend API for CallView by the calling list name, first contact in the coresponding calling list name will be shown.
export const fetchByCallingListName = async (callingListName) => {
  return await secureApiFetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/api/concalllist/${callingListName}/calllistname`
  );
};

//Add one contact through the form
export const addContact = async (newContact) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/contacts/add_one`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    }
  );
};

// Upload contacts file with mapping and calling list
export const uploadContactsFile = async (file, mapping, callingList) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mapping", JSON.stringify(mapping));
  formData.append("callingList", callingList);

  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/contacts/upload_contacts`,
    { method: "POST", body: formData }
  );
};

// Fetching all organizations names for add contact form
export const fetchOrganizations = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/organizations/all`
  );
};

// Fetching all calling lists names for add contact form
export const fetchCallLists = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/callinglist/all`
  );
};

//Fetching data for Contact list view with the last call status on contact_calling_list id
export const fullContactsCallLists = async () => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/all`
  );
};

//Remove contacts and their associations from call lists
export const removeContactsCallLists = async (contactIds) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/remove`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactIds),
    }
  );
};

export const addNote = async (ccl_id, noteValue) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/${ccl_id}/note`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: noteValue }),
    }
  );
};

// Add call status to contact_calling_list entry
export const addStatus = async (ccl_id, newStatus) => {
  return await apiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/calllogs/${ccl_id}/status`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }
  );
};

export const editContact = async (toEdit) => {
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/contacts/edit`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toEdit),
    }
  );
};
