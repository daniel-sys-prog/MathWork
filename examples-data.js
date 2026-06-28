/* ============================================================
   EXAMPLES-DATA.JS
   Conjunto de exemplos da galeria interativa (seção 07).
   Cada registro é renderizado por gallery.renderAll() (main.js)
   em um cartão com gráfico Plotly, controles de a/b/h/k e
   botão de restauração dos valores originais.

   orientation: 'h' (foco no eixo x) | 'v' (foco no eixo y)
   tags: usadas pelos filtros da galeria
---------------------------------------------------------- */

window.HYPERBOLE_EXAMPLES = [
  {
    id: 'g01', n: '01', tags: ['horizontal'],
    title: 'Forma canônica horizontal',
    orientation: 'h', a: 4, b: 3, h: 0, k: 0,
    note: 'Este é o exemplo de referência: centro na origem, focos sobre o eixo x. Aumente b e veja as assíntotas ficarem mais inclinadas; aumente a e veja os vértices se afastarem do centro.'
  },
  {
    id: 'g02', n: '02', tags: ['vertical'],
    title: 'Forma canônica vertical',
    orientation: 'v', a: 3, b: 4, h: 0, k: 0,
    note: 'A mesma estrutura do exemplo 01, com x e y trocados: agora os focos ficam sobre o eixo y e os ramos da curva abrem para cima e para baixo.'
  },
  {
    id: 'g03', n: '03', tags: ['horizontal', 'transladada'],
    title: 'Translação do centro — caso horizontal',
    orientation: 'h', a: 3, b: 2, h: 4, k: 2,
    note: 'Mova h e k e observe: a curva inteira se desloca junto com o centro, sem mudar de forma — apenas de posição no plano.'
  },
  {
    id: 'g04', n: '04', tags: ['vertical', 'transladada'],
    title: 'Translação do centro — caso vertical',
    orientation: 'v', a: 2, b: 3, h: -3, k: 3,
    note: 'O mesmo efeito do exemplo 03, agora na orientação vertical. Note que o centro foi deslocado para o segundo quadrante (x negativo, y positivo).'
  },
  {
    id: 'g05', n: '05', tags: ['equilatera'],
    title: 'Hipérbole equilátera',
    orientation: 'h', a: 3, b: 3, h: 0, k: 0,
    note: 'Aqui a é igual a b: um caso especial chamado hipérbole equilátera. Experimente manter a = b em outros valores e veja que as assíntotas sempre formam um ângulo reto entre si.'
  },
  {
    id: 'g06', n: '06', tags: ['excentrica', 'vertical'],
    title: 'Excentricidade elevada',
    orientation: 'h', a: 1, b: 5, h: 0, k: 0,
    note: 'Aumente bastante o valor de b em relação a a: os ramos se abrem mais. Esse efeito é medido pela excentricidade, que cresce conforme b cresce.'
  },
  {
    id: 'g07', n: '07', tags: ['excentrica', 'horizontal'],
    title: 'Excentricidade próxima de 1',
    orientation: 'h', a: 6, b: 1, h: 0, k: 0,
    note: 'Agora é o oposto do exemplo 06: a é bem maior que b. Os ramos ficam estreitos e os vértices próximos do centro, com excentricidade próxima do menor valor possível.'
  },
  {
    id: 'g08', n: '08', tags: ['horizontal', 'transladada'],
    title: 'Centro em região de coordenadas negativas',
    orientation: 'h', a: 2, b: 2, h: -4, k: -3,
    note: 'Desloque o centro para valores negativos de h e k. A leitura dos elementos funciona do mesmo jeito de sempre — só muda o ponto de partida no plano.'
  },
  {
    id: 'g09', n: '09', tags: ['horizontal'],
    title: 'Escala ampliada',
    orientation: 'h', a: 7, b: 5, h: 0, k: 0,
    note: 'Aumente a e b mantendo a mesma proporção entre eles: a curva cresce de tamanho, mas mantém a mesma abertura.'
  },
  {
    id: 'g10', n: '10', tags: ['equilatera', 'horizontal'],
    title: 'Caso unitário',
    orientation: 'h', a: 1, b: 1, h: 0, k: 0,
    note: 'O menor caso equilátero possível, com a = b = 1. Um bom exemplo para confirmar a conta c² = a² + b² usando números pequenos e fáceis de verificar.'
  },
  {
    id: 'g11', n: '11', tags: ['horizontal', 'transladada'],
    title: 'Translação combinada com reescala',
    orientation: 'h', a: 5, b: 2, h: 2, k: -2,
    note: 'Aqui dois efeitos aparecem juntos: mover h e k reposiciona a curva, enquanto mudar a e b altera sua forma — são ajustes independentes.'
  },
  {
    id: 'g12', n: '12', tags: ['vertical', 'excentrica'],
    title: 'Eixo imaginário dominante',
    orientation: 'v', a: 2, b: 7, h: 0, k: 0,
    note: 'Na orientação vertical, um valor grande de b faz os ramos se afastarem bastante um do outro. Mova o controle de b e observe a curva ficar mais larga.'
  },
  {
    id: 'g13', n: '13', tags: ['equilatera', 'vertical'],
    title: 'Equilátera vertical',
    orientation: 'v', a: 4, b: 4, h: 0, k: 0,
    note: 'A condição a = b também vale na orientação vertical: as assíntotas continuam formando 90° entre si, apenas giradas em relação ao exemplo 05.'
  },
  {
    id: 'g14', n: '14', tags: ['horizontal', 'transladada'],
    title: 'Deslocamento horizontal acentuado',
    orientation: 'h', a: 3, b: 1, h: 5, k: 0,
    note: 'Desloque apenas no eixo x (mude h e deixe k em 0): a curva se move só para os lados, sem subir ou descer.'
  },
  {
    id: 'g15', n: '15', tags: ['vertical', 'transladada'],
    title: 'Translação para o primeiro quadrante',
    orientation: 'v', a: 2, b: 5, h: -2, k: 4,
    note: 'Translade ao mesmo tempo em x e em y. Note que mexer em h não afeta k: são dois movimentos independentes, que podem ser combinados livremente.'
  },
  {
    id: 'g16', n: '16', tags: ['horizontal', 'transladada'],
    title: 'Deslocamento vertical do centro',
    orientation: 'h', a: 6, b: 3, h: 0, k: -5,
    note: 'Desloque apenas no eixo y (mude k e deixe h em 0): a curva sobe ou desce, mas continua horizontal — orientação e deslocamento são coisas diferentes.'
  },
  {
    id: 'g17', n: '17', tags: ['excentrica', 'horizontal'],
    title: 'Abertura ampla com vértices próximos',
    orientation: 'h', a: 1, b: 3, h: 0, k: 0,
    note: 'Reduza a e aumente b: os vértices ficam bem próximos do centro e as assíntotas, bem inclinadas. Compare com o exemplo 07, que mostra o efeito contrário.'
  },
  {
    id: 'g18', n: '18', tags: ['equilatera', 'transladada'],
    title: 'Equilátera transladada',
    orientation: 'h', a: 5, b: 5, h: 3, k: 3,
    note: 'Combine a = b com um centro fora da origem: o resultado tem assíntotas perpendiculares, deslocadas junto com o centro.'
  },
  {
    id: 'g19', n: '19', tags: ['equilatera'],
    title: 'Equilátera de menor escala',
    orientation: 'h', a: 2, b: 2, h: 0, k: 0,
    note: 'Outra hipérbole equilátera, em escala menor que a do exemplo 05. Compare as duas: o ângulo das assíntotas não muda, só o tamanho da curva.'
  },
  {
    id: 'g20', n: '20', tags: ['horizontal', 'transladada'],
    title: 'Centro no terceiro quadrante',
    orientation: 'h', a: 4, b: 1, h: -3, k: -3,
    note: 'Desloque o centro para o terceiro quadrante (x e y negativos). Vértices e focos se movem junto, mantendo as mesmas distâncias do exemplo 01.'
  },
  {
    id: 'g21', n: '21', tags: ['vertical', 'transladada'],
    title: 'Translação vertical moderada',
    orientation: 'v', a: 3, b: 6, h: 0, k: 2,
    note: 'Um pequeno deslocamento vertical aplicado a uma hipérbole de abertura ampla. Ajuste k e veja como até um pequeno movimento já é perceptível.'
  },
  {
    id: 'g22', n: '22', tags: ['horizontal', 'transladada'],
    title: 'Síntese — translação e excentricidade combinadas',
    orientation: 'h', a: 7, b: 2, h: 1, k: -1,
    note: 'Reúne tudo o que foi visto: centro deslocado e razão b/a reduzida. Use este exemplo para revisar, em um só lugar, os efeitos já explorados nos anteriores.'
  }
];
