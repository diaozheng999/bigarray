#include "complex.h"
#include "stdio.h"

int main() {
  complex float n = 0.1 + 0.2i;

  float *real = (void *)&n;
  float *im = real + 1;

  printf("float 1 (real); %f\n", *real);
  printf("float 2 (im); %f\n", *im);
}
