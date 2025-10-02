export const ingredientIcon = (name: string) => {
    const map: Record<string, string> = {
        굵은대파: "leek.png",
        풍미버섯: "mushroom.png",
        특선에그: "egg.png",
        따끈따끈감자: "potato.png",
        특선사과: "apple.png",
        불맛허브: "herb.png",
        콩고기: "sausage.png",
        튼튼밀크: "milk.png",
        달콤한꿀: "honey.png",
        퓨어오일: "oil.png",
        따뜻한생강: "ginger.png",
        숙면토마토: "tomato.png",
        릴랙스카카오: "cacao.png",
        맛있는꼬리: "tail.png",
        연둣빛대두: "soybeans.png",
        연둣빛옥수수: "corn.png",
        각성원두: "coffeebeans.png",
    };
    return map[name] ?? "default.png";
};
