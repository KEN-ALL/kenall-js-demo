import React from 'react';

export type BrowserConfig = {
  scrollbarWidth: number;
};

export const BrowserConfigContext = React.createContext<BrowserConfig>({
  scrollbarWidth: 0,
});
