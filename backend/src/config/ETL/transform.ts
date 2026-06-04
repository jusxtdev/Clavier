import data from "./received.json" with { type: "json" };

let products: any = [];

/*
Schema for Product
title : str
description:str
price : float
stock : int
categories : Array(string)
images : str
 */

for (const keyboard of data.keyboards) {
  let newKeyboard :any= {
    title: keyboard.title,
    description: keyboard.description,
    price: Number(keyboard.price),
    stock: Number(keyboard.stock),
    categories: [keyboard.switchType, ...keyboard.layouts],
    images: keyboard.imageURL,
  };
  products.push(newKeyboard);
}

for (const keycaps of data.keycaps) {
  let newKeycaps: any = {
    title: keycaps.title,
    description: keycaps.description,
    price: Number(keycaps.price),
    stock: Number(keycaps.stock),
    categories: [keycaps.switchType, ...keycaps.layouts],
    images: keycaps.imageURL,
  };
  products.push(newKeycaps);
}

export { products };
