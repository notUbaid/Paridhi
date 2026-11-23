/** The signed-in person, or null in the open demo. */
export interface Account {
  email: string;
  signOut: () => void;
}
