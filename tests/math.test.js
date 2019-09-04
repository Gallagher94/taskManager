const {
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  add
} = require("../src/math");

test("Converts F to C correctly", () => {
  const fahrenheitToCelsiusResult = fahrenheitToCelsius(100);
  expect(fahrenheitToCelsiusResult).toBe(37.77777777777778);
});

test("Converts C to F correctly", () => {
  const celsiusToFahrenheitResult = celsiusToFahrenheit(37.77777777777778);
  expect(celsiusToFahrenheitResult).toBe(100);
});

test("Async test demo 1", done => {
  setTimeout(() => {
    expect(1).toBe(1);
    done();
  }, 2000);
});

test("Async test demo 1", async () => {
  await setTimeout(() => {
    expect(1).toBe(1);
  }, 2000);
});

test("Async test demo 1", async () => {
  const addResult = await add(2, 3);
  expect(addResult).toBe(5);
});

test("Async test demo 1", done => {
  add(2, 3).then(result => {
    expect(result).toBe(5);
    done();
  });
});

/**
 * Diference between ToBe and toEqual
 *
 * You can use toBe for primitives like strings, numbers or booleans.
 * toBe is used to test exact equality
 *
 * If you want to check the value of an object, use toEqual instead:
 * You can use toEqual for everything else.
 */
