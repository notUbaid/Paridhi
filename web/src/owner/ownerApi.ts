import { createContext, useContext } from 'react';
import { createOwnerApi, type OwnerApi } from '../api';

/** The owner calls for the current view: the signed-in owner's plots, or the sample plots at /demo. */
export const OwnerApiContext = createContext<OwnerApi>(createOwnerApi(''));

export const useOwnerApi = () => useContext(OwnerApiContext);
