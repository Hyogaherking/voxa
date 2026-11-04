import type { Imagem } from '@/lib/db';
import { urlPicto } from '@/data/pictogramas';

/** Mostra um pictograma do catálogo ou uma foto do responsável. */
export function Pictograma({ imagem, className = '', alt = '' }: { imagem: Imagem; className?: string; alt?: string }) {
  const src = imagem.tipo === 'picto' ? urlPicto(imagem.id) : imagem.dados;
  const extra = imagem.tipo === 'foto' ? 'rounded-2xl object-cover' : 'object-contain';
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} className={`${extra} ${className}`} />;
}
