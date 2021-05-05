@send @variadic
external reshape: (Genarray.t<'a, 'b, 'c>, array<int>) => Genarray.t<'a, 'b, 'c> = "reshape"

@send
external reshape_0: Genarray.t<'a, 'b, 'c> => Array0.t<'a, 'b, 'c> = "reshape"

@send
external reshape_1: (Genarray.t<'a, 'b, 'c>, int) => Array1.t<'a, 'b, 'c> = "reshape"

@send
external reshape_2: (Genarray.t<'a, 'b, 'c>, int, int) => Array2.t<'a, 'b, 'c> = "reshape"

@send
external reshape_3: (Genarray.t<'a, 'b, 'c>, int, int, int) => Array3.t<'a, 'b, 'c> = "reshape"
