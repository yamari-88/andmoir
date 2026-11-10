/* Единственный источник данных о товарах.
   tag   — размеры файла бирки и положение скотча LOOK (в % от бирки).
   scene — сцена на странице товара. Слои в % от поля 740×900 (x, y — левый верхний угол, w — ширина).
           'MIRROR' — место зеркала в порядке слоёв; mirror.reflection считается внутри зеркала.
   shade — картинка для большой тени справа. */
window.MOIR = {
  sizes: ["xs", "s", "m", "ind"],
  deliveryText:
    "We ship worldwide, wrapped in black tissue and total silence. " +
    "3–7 days in Europe, 7–14 days everywhere else. Free from 500 €. " +
    "If it does not feel like a second skin, send it back within 14 days. No questions. No explanations. " +
    "(Concept project — nothing really ships.)",
  products: {
    "black-dress": {
      id: "black-dress",
      name: "Black dress",
      price: 420,
      tagline: "Black. Barely there. A dress for disappearing beautifully.",
      text:
        "Black, almost absolute. A SCULPTURAL silhouette that refuses to explain itself.\n" +
        "Wear it when the room is too bright.\n" +
        "Wear it when you have NOTHING to prove.\n\n" +
        "The dress follows THE BODY without trying to please it, creating a tension between softness and severity.\n" +
        "Clean lines, exposed skin, and just enough restraint to make everything else feel UNNECESSARY.\n\n" +
        "Some things look better in the dark.",
      tag: { w: 322, h: 880, tape: { l: -18.32, t: 62.23, w: 131.06 } },
      scene: {
        layers: [
          { src: "scene-dress-left.webp", x: -3, y: 0.5, w: 50 },
          "MIRROR",
          { src: "scene-dress-right.webp", x: 46.5, y: 10, w: 57.6 }
        ],
        mirror: { src: "mirror.webp", x: 12.4, y: 4, w: 58.6, reflection: { src: "reflection.png", x: 38.7, y: 29, w: 30, ghost: false } },
        shade: "scene-dress-right.webp"
      }
    },
    "leather-coat": {
      id: "leather-coat",
      name: "Leather coat",
      price: 890,
      tagline: "Wet shine. Sharp shoulders. Looks better after midnight.",
      text:
        "Wet shine, sharp shoulders. A coat that does not ask for attention — it takes THE ROOM.\n" +
        "Wear it when the night starts late.\n" +
        "Wear it when you want to stay UNREAD.\n\n" +
        "The line falls long and heavy, with a collar that argues for silence.\n" +
        "Every surface catches the light and refuses to keep it. Cut to make everything underneath feel PRIVATE.\n\n" +
        "Looks better after midnight.",
      tag: { w: 393, h: 1019, tape: { l: -0.89, t: 67.62, w: 107.38 } },
      scene: {
        layers: ["MIRROR", { src: "scene-coat.webp", x: -2, y: 12, w: 62 }],
        mirror: { src: "mirror.webp", x: 38, y: 4, w: 58, reflection: { src: "scene-coat.webp", x: 34, y: 34, w: 34, ghost: true } },
        shade: "scene-coat.webp"
      }
    },
    "leather-skirt": {
      id: "leather-skirt",
      name: "Leather skirt",
      price: 390,
      tagline: "Second skin. Bad intentions included.",
      text:
        "Second skin. Bad intentions included.\n" +
        "Wear it when the chair is too comfortable.\n" +
        "Wear it when you want to be REMEMBERED wrong.\n\n" +
        "A short, close line of leather that moves half a second after you do.\n" +
        "Stitched tight, cut without apology, built to turn boots into a STATEMENT.\n\n" +
        "Some rules are meant to be worn out.",
      tag: { w: 345, h: 949, tape: { l: -11.45, t: 65.08, w: 122.32 } },
      scene: {
        layers: ["MIRROR", { src: "scene-skirt.webp", x: 46, y: 24, w: 52 }],
        mirror: { src: "mirror.webp", x: -2, y: 4, w: 58, reflection: { src: "scene-skirt.webp", x: 30, y: 38, w: 40, ghost: true } },
        shade: "scene-skirt.webp"
      }
    }
  }
};
