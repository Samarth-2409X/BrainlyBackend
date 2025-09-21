export function random(len) {
    let option = "wbdehwuvkbfshjkvbfhqkuegryuvfdshbvkbvhfjdsk1234567890";
    let ans = "";
    let length = option.length;
    for (let i = 0; i < len; i++) {
        ans += option[Math.floor((Math.random() * length))];
    }
    return ans;
}
//# sourceMappingURL=utils.js.map