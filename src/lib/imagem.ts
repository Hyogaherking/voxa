/**
 * Reduz uma foto escolhida pelo responsável (câmera ou galeria) para no máximo
 * `lado` pixels e devolve como texto (data URL). A foto fica só no aparelho.
 */
export async function prepararFoto(arquivo: File, lado = 480): Promise<string> {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, erro) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => erro(new Error('Não foi possível abrir essa imagem.'));
      i.src = url;
    });
    // Recorte quadrado central, igual ao formato dos cartões
    const menor = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - menor) / 2;
    const sy = (img.naturalHeight - menor) / 2;
    const tam = Math.min(lado, menor);
    const canvas = document.createElement('canvas');
    canvas.width = tam;
    canvas.height = tam;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível preparar a imagem.');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, menor, menor, 0, 0, tam, tam);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
