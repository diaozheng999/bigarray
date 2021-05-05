external genarray_of_array0: Array0.t<'a, 'b, 'c> => Genarray.t<'a, 'b, 'c> = "%identity"
external genarray_of_array1: Array1.t<'a, 'b, 'c> => Genarray.t<'a, 'b, 'c> = "%identity"
external genarray_of_array2: Array2.t<'a, 'b, 'c> => Genarray.t<'a, 'b, 'c> = "%identity"
external genarray_of_array3: Array3.t<'a, 'b, 'c> => Genarray.t<'a, 'b, 'c> = "%identity"

@send
external array0_of_genarray: (Genarray.t<'a, 'b, 'c>, @as(0) _) => Array0.t<'a, 'b, 'c> =
  "assertDimension"
@send
external array1_of_genarray: (Genarray.t<'a, 'b, 'c>, @as(1) _) => Array1.t<'a, 'b, 'c> =
  "assertDimension"
@send
external array2_of_genarray: (Genarray.t<'a, 'b, 'c>, @as(2) _) => Array2.t<'a, 'b, 'c> =
  "assertDimension"
@send
external array3_of_genarray: (Genarray.t<'a, 'b, 'c>, @as(3) _) => Array3.t<'a, 'b, 'c> =
  "assertDimension"
