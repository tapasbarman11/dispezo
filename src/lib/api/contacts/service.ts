import { createContact, deleteContact, deleteContacts, getContact, insertContacts, listContacts, listTags, updateContact, ContactInput } from "./repository";
import { parseContactsCsv } from "./csv";

export { parseContactsCsv };
export { getContactsByTag } from "./repository";

export async function listContactsService(organizationId: string, options: { page: number; pageSize: number; search?: string; tag?: string }) {
  return listContacts(organizationId, options);
}

export async function createContactService(organizationId: string, data: ContactInput) {
  if (!data.phone?.trim()) throw new Error("Phone number is required.");
  return createContact(organizationId, data);
}

export async function updateContactService(id: string, organizationId: string, data: ContactInput) {
  if (!data.phone?.trim()) throw new Error("Phone number is required.");
  return updateContact(id, organizationId, data);
}

export async function deleteContactService(id: string, organizationId: string) {
  return deleteContact(id, organizationId);
}

export async function deleteContactsService(ids: string[], organizationId: string) {
  return deleteContacts(ids, organizationId);
}

export async function getAudiences(organizationId: string) {
  return listTags(organizationId);
}

export async function getContactService(id: string, organizationId: string) {
  return getContact(id, organizationId);
}

export async function uploadContacts(organizationId: string, csvText: string, tag: string) {
  const rows = parseContactsCsv(csvText, tag);
  if (!rows.length) throw new Error("No valid contact rows found in CSV.");
  const inserted = await insertContacts(organizationId, rows);
  return { parsed: rows.length, inserted };
}
