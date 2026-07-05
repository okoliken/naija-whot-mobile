import { Redirect } from "expo-router";

/** The game now lives on the root screen; keep whot://game links working. */
export default function GameRedirect() {
  return <Redirect href="/" />;
}
