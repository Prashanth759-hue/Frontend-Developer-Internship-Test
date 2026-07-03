// Web only: react-native-web renders ImageBackground's image as a real CSS
// background, and Image as a real <img>. Both support position control,
// which RN's resizeMode="cover" alone does not expose. We anchor to the
// top so the logo/heading at the top of each background is always kept
// fully visible — any cropping from "cover" happens at the bottom instead,
// which is empty road/space in our images.
export const bgTopAnchor = {
  backgroundPosition: 'top center',
};

export const bgTopAnchorImg = {
  objectPosition: 'top center',
};
