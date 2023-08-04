import { OrganizationId } from '@dogu-private/types';

export interface HeadingProps {
  children: React.ReactNode;
  centered?: boolean;
}

export interface OrganizationIntegrationButtonProps {
  isConnected: boolean;
  organizationId: OrganizationId;
}

export interface ProjectIntegrationButtonProps extends OrganizationIntegrationButtonProps {
  projectId: string;
}
