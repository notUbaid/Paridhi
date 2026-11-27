import { createOwnerApi } from '../api';
import OwnerView from '../owner/OwnerView';
import { OwnerApiContext } from '../owner/ownerApi';

const demoApi = createOwnerApi('/demo');

/** The sample plots, open to everyone. */
export default function DemoPage() {
  return (
    <OwnerApiContext.Provider value={demoApi}>
      <OwnerView account={null} />
    </OwnerApiContext.Provider>
  );
}
