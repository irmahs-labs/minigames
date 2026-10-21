/** The rules in five lines, under both the local and the online game. */
export const HowToPlay = () => (
  <div className="stack">
    <h3 className="field-label">How to play</h3>
    <ol className="how-to">
      <li>Pink 🌸 starts, on any planet. Then Purple 🔮, and so on.</li>
      <li>
        The square you take sends the other player to the planet it is named
        after.
      </li>
      <li>Three in a row on a planet conquers it.</li>
      <li>Sent to a planet that is conquered or full? Visit any planet.</li>
      <li>Conquer three planets in a row to win.</li>
    </ol>
  </div>
);
