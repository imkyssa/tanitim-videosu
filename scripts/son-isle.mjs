// Son işlem: out/<KOD>-<oran>.mp4 için (ses.mjs sonunda kendiliğinden çalışır; elle de çalıştırılabilir)
//  1) ses yüksekliğini ölç; hedefteyse (±0,3 LU, tepe ≤ -1 dBTP) sesi kopyala, değilse iki geçişli doğrusal loudnorm → -14 LUFS
//  2) görüntüyü yeniden kodlamadan bt709 renk etiketleri (primaries/transfer/matrix, tv aralık)
//   node betik/son-isle.mjs F1 16x9 9x16 1x1
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { FF } from './ortak.mjs';

const [kod, ...oranlar] = process.argv.slice(2);
const HEDEF = { I: -14, TP: -1.5, LRA: 11 };
for (const o of oranlar) {
  const g = `out/${kod}-${o}.mp4`, c = `out/${kod}-${o}-son.mp4`;
  const olc = spawnSync(FF, ['-hide_banner', '-nostats', '-i', g, '-map', '0:a', '-af', `loudnorm=I=${HEDEF.I}:TP=${HEDEF.TP}:LRA=${HEDEF.LRA}:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
  const j = JSON.parse(olc.stderr.slice(olc.stderr.lastIndexOf('{'), olc.stderr.lastIndexOf('}') + 1));
  // zaten hedefteyse sesi yeniden kodlama (kayıpsız kopya); değilse iki geçişli doğrusal loudnorm. aresample first_pts=0: ses akışı 0'dan başlasın.
  const hedefte = Math.abs(+j.input_i - HEDEF.I) <= .3 && +j.input_tp <= -1;
  const af = `loudnorm=I=${HEDEF.I}:TP=${HEDEF.TP}:LRA=${HEDEF.LRA}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000:async=1:first_pts=0`;
  const ses = hedefte ? ['-c:a', 'copy'] : ['-af', af, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000'];
  const r = spawnSync(FF, ['-v', 'error', '-y', '-i', g, '-map', '0:v', '-map', '0:a', '-c:v', 'copy',
    '-bsf:v', 'h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0',
    ...ses, '-movflags', '+faststart', '-shortest', c], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg: ' + g);
  fs.renameSync(c, g);
  console.log(`${g}: ölçülen ${j.input_i} LUFS / ${j.input_tp} dBTP → ${hedefte ? 'hedefte, ses kopyalandı' : `iki geçişli doğrusal loudnorm (${HEDEF.I} / ${HEDEF.TP})`}; renk bt709 etiketlendi`);
}
