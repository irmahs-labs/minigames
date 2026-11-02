import { say } from "./french";
import { placementOf } from "./zodiac";

/** "♏ Scorpio": the sign at a longitude, its glyph for the eye only. */
export const SignName = ({ longitude }: { longitude: number }) => {
  const { sign } = placementOf(longitude);

  return (
    <>
      <span aria-hidden="true">{sign.glyph} </span>
      {say(sign.name)}
    </>
  );
};
