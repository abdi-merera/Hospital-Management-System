export interface PermissionDefinition {
  code: string;
  description: string;
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
}

export interface RolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface PermissionPayload {
  code?: string;
  description?: string;
}

