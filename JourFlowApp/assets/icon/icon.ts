const icons = {
    angry: require("./angry.json"),
    happy: require("./happy.json"),
    normal: require("./normal.json"),
    sad: require("./sad.json"),
    soSo: require("./so-so.json"),
    terrible: require("./terrible.json"),
    veryAngry: require("./very-angry.json"),
    verryHappy: require("./very-happy.json"),
    verySad: require("./very-sad.json"),
}

export type IconPath = keyof typeof icons;
export default icons;