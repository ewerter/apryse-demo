export interface ApryseConfig {
  licenseKey: string;
}

// Read from environment variable
export const apryseConfig: ApryseConfig = {
  licenseKey: import.meta.env.VITE_APRYSE_LICENSE_KEY || ''
};