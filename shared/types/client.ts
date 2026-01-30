export type ClientDto = {
  id: string;
  name: string;
  last_name: string;
  doc: string;
  email: string;
  address: string;
  country: string;
  state: string;
  phone: string;
};

export type ClientListItemDto = ClientDto & {
  saldo: number;
};

export type ClientCreateInput = Omit<ClientDto, "id">;

export type ClientUpdateInput = Partial<ClientCreateInput>;
