import type { ReactNode } from 'react';
import { Camera, HelpCircle, Landmark, Lock, Scale, ShieldCheck, UserCheck } from 'lucide-react';
import { Modal } from './Modal';

function Part({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="p-3.5 rounded border border-slate-200 bg-white space-y-1.5">
      <div className="flex items-center gap-2 font-semibold text-slate-900">
        <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center">{icon}</span>
        {title}
      </div>
      <p className="text-slate-600">{children}</p>
    </div>
  );
}

export function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      icon={<HelpCircle className="w-4 h-4 text-slate-700 shrink-0" />}
      title="How Paridhi works"
      footer={
        <>
          <span className="text-xs text-slate-500">Proposed pricing: ₹4,999 / month per plot, including the camera.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer"
          >
            Got it
          </button>
        </>
      }
    >
      <div className="p-6 space-y-6 text-slate-800 text-xs leading-relaxed">
        <section className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">The problem</h3>
          <p className="text-slate-600">
            Vacant plots usually have no mains power, no internet and no compound wall, so ordinary home cameras don't
            work there. Encroachment tends to start small: dumped bricks or gravel, a boundary peg moved a foot, a tin
            shed. Fraud can also start on paper, with a mutation application at the revenue office. Owners living
            abroad often hear about it late, and land disputes in Indian civil courts can take many years.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-slate-900 text-sm mb-3">Four layers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Part icon={<Camera className="w-3.5 h-3.5" />} title="1. Solar 4G camera">
              An off-the-shelf solar 4G camera on a 4.5 m pole. It uploads scheduled snapshots and motion clips over
              4G, and a weekly comparison flags new material, vehicles or structures. Sized for about a week without
              sun during the monsoon.
            </Part>
            <Part icon={<UserCheck className="w-3.5 h-3.5" />} title="2. Monthly field inspection">
              A local inspector walks the boundary, checks each corner peg and talks to neighbours. Photo GPS
              positions are checked against the surveyed pegs. You can ask for an extra visit, with a target of 48
              hours.
            </Part>
            <Part icon={<Landmark className="w-3.5 h-3.5" />} title="3. Land record watch">
              Paridhi staff check the state land records portal (Bhu Bharati in Telangana, Bhoomi and E-Swathu in
              Karnataka, Jamabandi in Punjab) for new mutation applications. Portals don't send notifications, so
              checks are periodic.
            </Part>
            <Part icon={<Scale className="w-3.5 h-3.5" />} title="4. Advocate and caveat">
              A retained local advocate can lodge a caveat under Section 148A CPC in the civil court, so the court must
              notify them before passing orders on an application about your plot. A caveat lasts 90 days. Objections
              to a mutation are filed separately with the revenue office.
            </Part>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-700" />
            Theft resistance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900 mb-0.5">High pole</div>
              <div className="text-slate-600 text-[11px]">
                Galvanised iron pole in a concrete footing, with a loose anti-climb sleeve and security bolts.
              </div>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900 mb-0.5">Footage leaves the site</div>
              <div className="text-slate-600 text-[11px]">
                Snapshots upload as they are taken, and a heartbeat every 60 seconds means a camera that goes silent is
                noticed quickly.
              </div>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900 mb-0.5">Warning sign</div>
              <div className="text-slate-600 text-[11px]">
                A notice that the plot is monitored. Final wording is approved by the local advocate.
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-4 space-y-2">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            Records you can check
          </h3>
          <p className="text-slate-600">
            Camera incidents and dossiers are hashed (SHA-256) and signed (Ed25519) by the server when it receives
            them, and anyone can verify them with Paridhi's public key. That shows a record hasn't been altered since;
            it doesn't by itself make it admissible. In court, electronic records need a certificate under Section 63
            of the Bharatiya Sakshya Adhiniyam, 2023, and the court decides.
          </p>
        </section>
      </div>
    </Modal>
  );
}
