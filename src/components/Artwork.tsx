import { useId } from 'react'
import { cn } from '../utils'

interface ArtworkProps {
  variant?: string
  className?: string
  rounded?: boolean
}

const normalise = (v: string) => {
  if (v.startsWith('live_')) {
    const rest = v.slice(5)
    if (rest === 'sage') return 'sage'
    if (rest === 'night') return 'night'
    if (rest === 'peach') return 'dusk'
    if (rest === 'flowers') return 'flowers'
    return rest
  }
  return v
}

export function Artwork({ variant = 'window', className, rounded }: ArtworkProps) {
  const id = useId().replace(/[:]/g, '')
  const v = normalise(variant)
  const sky = `sky-${id}`
  const accent = `accent-${id}`
  const deep = `deep-${id}`
  const glow = `glow-${id}`

  return (
    <svg
      className={cn('artwork', rounded && 'artwork-rounded', className)}
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="观心插画"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4EEDF" />
          <stop offset="100%" stopColor="#E4D8C6" />
        </linearGradient>
        <linearGradient id={accent} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D9A17F" />
          <stop offset="100%" stopColor="#BE7E63" />
        </linearGradient>
        <linearGradient id={deep} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#456258" />
          <stop offset="100%" stopColor="#29463D" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="#FFF7E7" />
          <stop offset="100%" stopColor="#F7E7C7" />
        </radialGradient>
      </defs>

      {v === 'window' && (
        <g>
          <rect width="400" height="300" fill={`url(#${sky})`} />
          <rect x="88" y="26" width="224" height="240" rx="112" fill="#F9F3E6" />
          <rect x="100" y="38" width="200" height="216" rx="100" fill={`url(#${glow})`} />
          <circle cx="202" cy="102" r="34" fill="#F2C96D" opacity="0.9" />
          <path d="M100 190C135 167 158 176 181 188C209 202 235 186 300 168V254H100V190Z" fill="#B7C4AC" />
          <path d="M100 216C138 197 165 207 194 218C228 231 262 214 300 201V254H100V216Z" fill="#8CA18C" />
          <path d="M100 240C145 223 192 237 228 242C255 246 280 240 300 232V254H100V240Z" fill="#637D6C" />
          <path d="M200 38V254M100 148H300" stroke="#F9F3E6" strokeWidth="8" />
          <rect x="60" y="260" width="280" height="10" rx="5" fill="#C7A887" opacity="0.55" />
          <g transform="translate(52 208)">
            <path d="M20 58C8 37 11 17 27 4C40 22 39 41 20 58Z" fill="#4F6C5D" />
            <path d="M23 58C30 35 43 26 58 26C55 46 42 57 23 58Z" fill="#6F8B75" />
            <path d="M18 58C7 46 -1 31 1 16C16 24 24 39 18 58Z" fill="#8DA88B" />
            <path d="M27 56C23 65 22 74 23 82" stroke="#5C725F" strokeWidth="2" fill="none" />
          </g>
        </g>
      )}

      {v === 'flowers' && (
        <g>
          <rect width="400" height="300" fill="#EFE3D2" />
          <circle cx="73" cy="45" r="92" fill="#F8EDDC" opacity="0.8" />
          <path d="M0 226C86 200 142 236 206 228C284 218 331 186 400 203V300H0V226Z" fill="#DCC9B3" />
          <rect x="173" y="202" width="54" height="70" rx="12" fill="#C88D76" />
          <path d="M183 202C183 185 196 172 200 166C204 172 217 185 217 202H183Z" fill="#B97D67" />
          <g stroke="#6E8A71" strokeWidth="3.2" fill="none">
            <path d="M200 172C193 131 172 114 153 98" />
            <path d="M200 172C203 129 218 107 241 84" />
            <path d="M200 172C189 139 206 113 197 79" />
            <path d="M200 172C222 149 252 144 270 122" />
          </g>
          {[
            [148, 90, 15, '#F1C9B3'],
            [241, 78, 17, '#F4D389'],
            [195, 70, 14, '#FAE9D3'],
            [274, 116, 13, '#EAB2A2'],
            [160, 126, 10, '#F6DBAF'],
          ].map(([x, y, r, color], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy={-Number(r) * 0.55} rx={Number(r) * 0.38} ry={Number(r) * 0.62} fill={String(color)} transform={`rotate(${a})`} />
              ))}
              <circle r={Number(r) * 0.28} fill="#E3AC61" />
            </g>
          ))}
          <path d="M177 74C165 58 162 44 168 27C183 36 188 53 181 73Z" fill="#89A18A" />
          <path d="M268 165C282 154 296 154 308 162C297 175 282 178 268 165Z" fill="#7C967D" />
          <circle cx="330" cy="62" r="28" fill="#E9C4A9" opacity="0.26" />
        </g>
      )}

      {v === 'mountain' && (
        <g>
          <rect width="400" height="300" fill="#DDE5DC" />
          <circle cx="298" cy="87" r="44" fill="#F1CC78" />
          <path d="M0 200L79 112L137 178L198 105L264 190L325 122L400 195V300H0V200Z" fill="#9EAFA0" />
          <path d="M0 236L95 158L168 224L239 152L309 220L400 159V300H0V236Z" fill="#6D8877" />
          <path d="M0 264L92 219L172 258L252 207L333 252L400 225V300H0V264Z" fill="#405D50" />
          <path d="M266 82C277 78 285 78 296 81" stroke="#F8F0DF" strokeWidth="2.5" fill="none" opacity="0.8" />
          <g fill="#F8F2E4" opacity="0.8">
            <circle cx="68" cy="76" r="2" />
            <circle cx="112" cy="56" r="1.4" />
            <circle cx="338" cy="46" r="1.7" />
          </g>
          <path d="M222 185C222 185 223 170 228 166C232 170 232 182 232 185" stroke="#3D564A" strokeWidth="3" fill="none" />
          <circle cx="225" cy="162" r="3" fill="#3D564A" />
        </g>
      )}

      {v === 'forest' && (
        <g>
          <rect width="400" height="300" fill="#DDE5D7" />
          <circle cx="292" cy="59" r="31" fill="#F3DAA3" opacity="0.75" />
          <path d="M104 0L194 300H34L104 0Z" fill="#FFFFFF" opacity="0.18" />
          <path d="M278 0L360 300H232L278 0Z" fill="#FFFFFF" opacity="0.14" />
          {[38, 86, 138, 322, 365].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 300C${x - 7} 212 ${x + 8} 106 ${x + 3} 0`} stroke="#657C68" strokeWidth={i % 2 === 0 ? 14 : 9} fill="none" />
              <path d={`M${x - 4} 112C${x - 38} 86 ${x - 52} 55 ${x - 58} 23`} stroke="#788E78" strokeWidth="5" fill="none" />
              <path d={`M${x + 3} 156C${x + 38} 133 ${x + 58} 103 ${x + 70} 70`} stroke="#788E78" strokeWidth="5" fill="none" />
            </g>
          ))}
          <path d="M0 267C84 244 159 262 233 254C305 246 357 230 400 238V300H0V267Z" fill="#7F977F" />
          <path d="M0 280C89 262 159 278 247 271C320 265 365 256 400 260V300H0V280Z" fill="#5B7460" />
          <g fill="#C7A67E">
            <ellipse cx="187" cy="270" rx="7" ry="2.5" />
            <ellipse cx="211" cy="278" rx="5" ry="2" />
          </g>
        </g>
      )}

      {v === 'garden' && (
        <g>
          <rect width="400" height="300" fill="#E5E7D9" />
          <path d="M86 270V113C86 57 138 28 200 28C262 28 314 57 314 113V270" fill="#F6F0E4" />
          <path d="M101 270V116C101 66 147 42 200 42C253 42 299 66 299 116V270" fill="#D7E2D3" />
          <circle cx="200" cy="129" r="57" fill="#F7EBCF" opacity="0.65" />
          <g stroke="#6D866F" strokeWidth="3" fill="none">
            <path d="M103 270C100 214 122 174 150 148" />
            <path d="M297 270C301 212 279 170 251 146" />
            <path d="M72 270C77 212 53 148 35 97" />
            <path d="M328 270C325 218 350 158 368 111" />
          </g>
          {[
            [111, 239, -24, '#7D967C'],
            [139, 181, 20, '#8DA68A'],
            [285, 234, 25, '#789175'],
            [260, 176, -18, '#92A98D'],
            [54, 188, 18, '#6E876D'],
            [348, 194, -22, '#7F987D'],
          ].map(([x, y, r, c], i) => (
            <ellipse key={i} cx={Number(x)} cy={Number(y)} rx="24" ry="12" fill={String(c)} transform={`rotate(${Number(r)} ${x} ${y})`} />
          ))}
          <path d="M0 272C85 256 148 268 217 264C291 260 349 244 400 252V300H0V272Z" fill="#C5BEA6" />
          <g fill="#E5B5A3">
            <circle cx="146" cy="209" r="6" />
            <circle cx="154" cy="213" r="4" />
            <circle cx="242" cy="222" r="5" />
          </g>
        </g>
      )}

      {v === 'sea' && (
        <g>
          <rect width="400" height="300" fill="#E3E8E4" />
          <rect y="132" width="400" height="168" fill="#BFD2CD" />
          <circle cx="286" cy="75" r="39" fill="#F2CE81" />
          <path d="M0 158C62 145 110 165 171 158C240 150 305 141 400 157V300H0V158Z" fill="#94B2AE" />
          <path d="M0 190C68 177 123 200 197 190C267 181 325 175 400 189V300H0V190Z" fill="#6E9593" />
          <path d="M0 225C70 211 131 235 207 223C280 212 341 207 400 222V300H0V225Z" fill="#4D7778" />
          <g stroke="#F7F1E5" strokeWidth="2" fill="none" opacity="0.6">
            <path d="M38 177C50 172 61 172 73 177" />
            <path d="M138 205C150 200 164 200 177 205" />
            <path d="M274 238C286 233 301 233 314 238" />
            <path d="M318 167C328 163 338 163 348 167" />
          </g>
          <path d="M58 111C66 102 78 102 86 111" stroke="#778B84" strokeWidth="2" fill="none" />
          <path d="M38 94C46 86 58 86 66 94" stroke="#778B84" strokeWidth="2" fill="none" />
        </g>
      )}

      {v === 'desk' && (
        <g>
          <rect width="400" height="300" fill="#EADFCE" />
          <circle cx="96" cy="54" r="74" fill="#F8F0E1" opacity="0.7" />
          <rect y="218" width="400" height="82" fill="#BE9A78" />
          <rect y="218" width="400" height="7" fill="#A98464" />
          <g transform="translate(61 156)">
            <rect width="82" height="14" rx="5" fill="#587166" />
            <rect y="16" width="72" height="13" rx="5" fill="#C97962" />
            <rect x="5" y="31" width="86" height="16" rx="5" fill="#E1C68E" />
            <rect x="58" y="52" width="18" height="33" rx="6" fill="#DED5C5" />
          </g>
          <g transform="translate(260 184)">
            <rect x="7" y="20" width="42" height="36" rx="8" fill="#F8F1E5" />
            <path d="M49 29C62 29 63 47 49 47" stroke="#F8F1E5" strokeWidth="7" fill="none" />
            <path d="M20 11C16 4 22 -3 19 -10M33 11C29 4 35 -3 32 -10" stroke="#E8DDCB" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <g transform="translate(173 130)">
            <path d="M3 83C-2 36 14 6 39 0C65 -6 77 24 72 83" fill="#D5B788" opacity="0.3" />
            <path d="M39 0V56M39 26C18 26 10 10 13 -5C32 -1 40 8 39 26ZM39 36C58 34 67 20 65 4C47 8 39 18 39 36Z" fill="#6C846E" />
          </g>
          <circle cx="206" cy="52" r="28" fill="#F2C96D" opacity="0.35" />
          <rect x="161" y="218" width="85" height="3" fill="#A98464" opacity="0.6" />
        </g>
      )}

      {v === 'dusk' && (
        <g>
          <rect width="400" height="300" fill="#EECDB8" />
          <rect width="400" height="300" fill="url(#none)" />
          <circle cx="274" cy="94" r="53" fill="#F3C46F" opacity="0.95" />
          <ellipse cx="274" cy="94" rx="80" ry="80" fill="#F6D69C" opacity="0.24" />
          <path d="M0 197C62 158 111 178 166 188C229 200 282 165 400 127V300H0V197Z" fill="#C99B82" opacity="0.72" />
          <path d="M0 222C72 195 132 219 198 216C275 212 338 183 400 178V300H0V222Z" fill="#8B9B88" />
          <path d="M0 255C84 230 146 252 219 246C290 240 348 224 400 231V300H0V255Z" fill="#586F62" />
          <path d="M95 67C103 59 114 59 122 67" stroke="#866A5B" strokeWidth="2" fill="none" opacity="0.7" />
          <path d="M139 90C147 82 158 82 166 90" stroke="#866A5B" strokeWidth="2" fill="none" opacity="0.6" />
          <g fill="#7B6558" opacity="0.4">
            <circle cx="56" cy="63" r="1.6" />
            <circle cx="334" cy="44" r="1.4" />
          </g>
        </g>
      )}

      {v === 'night' && (
        <g>
          <rect width="400" height="300" fill="#243D45" />
          <circle cx="302" cy="79" r="38" fill="#F1DDB1" />
          <circle cx="318" cy="69" r="32" fill="#243D45" opacity="0.55" />
          <g fill="#F6EDD9">
            <circle cx="78" cy="52" r="2.3" />
            <circle cx="138" cy="91" r="1.4" />
            <circle cx="207" cy="47" r="1.8" />
            <circle cx="250" cy="127" r="1.2" />
            <circle cx="352" cy="41" r="1.5" />
            <circle cx="57" cy="137" r="1.2" />
            <path d="M166 23L169 32L178 35L169 38L166 47L163 38L154 35L163 32Z" />
          </g>
          <path d="M0 224L47 195L92 218L141 186L196 221L246 189L299 215L347 190L400 211V300H0V224Z" fill="#1A2E35" />
          <g fill="#E7BF79">
            <rect x="64" y="224" width="12" height="18" opacity="0.7" />
            <rect x="156" y="231" width="10" height="13" opacity="0.5" />
            <rect x="290" y="222" width="14" height="16" opacity="0.65" />
          </g>
          <path d="M0 259C85 244 142 262 220 254C299 246 348 241 400 251V300H0V259Z" fill="#12252B" />
          <path d="M0 274C90 260 161 277 238 271C314 265 359 261 400 266V300H0V274Z" fill="#0D1E23" />
        </g>
      )}

      {v === 'sage' && (
        <g>
          <rect width="400" height="300" fill="#DCE5D8" />
          <circle cx="308" cy="77" r="91" fill="#EEF2E6" opacity="0.7" />
          <path d="M-20 286C57 215 124 165 206 103C257 65 300 35 347 -9" stroke="#8FA58E" strokeWidth="3" fill="none" />
          {[
            [72, 225, -35, 35, 16],
            [121, 183, 24, 31, 14],
            [169, 148, -28, 40, 18],
            [222, 107, 20, 33, 15],
            [273, 70, -26, 35, 16],
            [318, 35, 18, 27, 12],
          ].map(([x, y, r, rx, ry], i) => (
            <ellipse key={i} cx={Number(x)} cy={Number(y)} rx={Number(rx)} ry={Number(ry)} fill={i % 2 ? '#7C957D' : '#A4B79B'} transform={`rotate(${Number(r)} ${x} ${y})`} />
          ))}
          <path d="M0 270C89 251 163 269 240 263C316 257 359 249 400 255V300H0V270Z" fill="#BCC9B4" />
          <circle cx="69" cy="73" r="26" fill="#EAC7AD" opacity="0.4" />
          <circle cx="342" cy="214" r="42" fill="#C2D0BA" opacity="0.7" />
        </g>
      )}

      {v === 'peach' && (
        <g>
          <rect width="400" height="300" fill="#F0DDD3" />
          <circle cx="122" cy="108" r="92" fill="#E9C4AF" opacity="0.55" />
          <circle cx="307" cy="208" r="111" fill="#F4E6DA" />
          <path d="M-20 263C79 204 145 218 197 258C245 295 333 249 420 218" stroke="#B98F7A" strokeWidth="2.5" fill="none" opacity="0.45" />
          <g fill="#C58B76" opacity="0.65">
            <circle cx="100" cy="74" r="6" />
            <circle cx="116" cy="62" r="4" />
            <circle cx="292" cy="91" r="5" />
            <circle cx="310" cy="106" r="3" />
          </g>
          <path d="M62 180C83 152 102 142 124 132" stroke="#8F7769" strokeWidth="2" fill="none" opacity="0.4" />
          <circle cx="344" cy="58" r="20" fill="#F3C78C" opacity="0.3" />
        </g>
      )}

      {v === 'spring' && (
        <g>
          <rect width="400" height="300" fill="#E5ECDC" />
          <circle cx="318" cy="72" r="80" fill="#F3E8CE" opacity="0.7" />
          <path d="M-10 254C97 195 180 230 251 251C314 269 359 249 412 223" stroke="#79937B" strokeWidth="4" fill="none" />
          {[
            [104, 217, -32],
            [179, 235, 24],
            [261, 256, -22],
            [329, 246, 16],
            [75, 185, 32],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <ellipse cx="0" cy="-19" rx="15" ry="31" fill={i % 2 ? '#8FAE8C' : '#A7BE9A'} />
              <path d="M0 12V-38" stroke="#6B876F" strokeWidth="1.5" />
            </g>
          ))}
          <circle cx="256" cy="178" r="13" fill="#F6E2C7" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-15" rx="7" ry="12" fill="#F6E2C7" transform={`translate(256 178) rotate(${a})`} />
          ))}
          <circle cx="256" cy="178" r="5" fill="#EBC16B" />
          <path d="M0 285C93 261 177 283 256 279C326 275 368 268 400 274V300H0V285Z" fill="#C8D3BE" />
        </g>
      )}

      {v === 'star' && (
        <g>
          <rect width="400" height="300" fill="#2A3D4E" />
          <circle cx="201" cy="150" r="92" fill="#3B5063" opacity="0.55" />
          <ellipse cx="201" cy="150" rx="137" ry="53" stroke="#D8C18B" strokeWidth="1.5" fill="none" transform="rotate(-18 201 150)" opacity="0.65" />
          <ellipse cx="201" cy="150" rx="159" ry="73" stroke="#D8C18B" strokeWidth="1" fill="none" transform="rotate(-18 201 150)" opacity="0.25" />
          <circle cx="107" cy="71" r="2.2" fill="#F7E9C9" />
          <circle cx="311" cy="95" r="1.6" fill="#F7E9C9" />
          <circle cx="84" cy="208" r="1.4" fill="#F7E9C9" />
          <circle cx="322" cy="223" r="2" fill="#F7E9C9" />
          <path d="M201 113L207 141L235 147L207 153L201 181L195 153L167 147L195 141Z" fill="#F0D28E" />
          <circle cx="300" cy="59" r="3" fill="#EED6A6" />
          <circle cx="98" cy="149" r="2.4" fill="#EED6A6" />
          <path d="M59 61L61 68L68 70L61 72L59 79L57 72L50 70L57 68Z" fill="#F3E4C4" opacity="0.8" />
        </g>
      )}

      {v === 'badge' && (
        <g>
          <rect width="400" height="300" fill="#EFE6D6" />
          <circle cx="200" cy="147" r="100" fill="#F8F0E2" />
          <circle cx="200" cy="147" r="83" fill="none" stroke="#CFAE78" strokeWidth="1.5" strokeDasharray="4 6" />
          <path d="M200 92L214 130L254 131L222 155L233 194L200 170L167 194L178 155L146 131L186 130Z" fill="#E7C378" />
          <path d="M175 198L158 250L200 229L242 250L225 198" fill="#C9745C" opacity="0.85" />
          <circle cx="200" cy="147" r="28" fill="#F8F0E2" opacity="0.45" />
          <path d="M200 135C190 124 174 141 186 151C193 157 200 163 200 163C200 163 207 157 214 151C226 141 210 124 200 135Z" fill="#C9745C" />
        </g>
      )}

      {v === 'cup' && (
        <g>
          <rect width="400" height="300" fill="#EDE4D5" />
          <circle cx="200" cy="139" r="113" fill="#F8F1E4" />
          <rect x="90" y="224" width="220" height="7" rx="3.5" fill="#CBB69C" />
          <path d="M135 123H260V219C260 233 251 242 238 242H157C144 242 135 233 135 219V123Z" fill="#F9F5EA" stroke="#C6B19A" strokeWidth="2" />
          <path d="M259 146C298 142 300 202 259 200" stroke="#F9F5EA" strokeWidth="18" fill="none" />
          <path d="M259 146C298 142 300 202 259 200" stroke="#C6B19A" strokeWidth="2" fill="none" />
          <rect x="145" y="161" width="104" height="3" fill="#DCCDB9" />
          <circle cx="169" cy="192" r="4" fill="#C87B64" />
          <path d="M181 192H222" stroke="#9EAD9A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M184 214H217" stroke="#CBBBA5" strokeWidth="2" strokeLinecap="round" />
          <path d="M169 109C164 98 173 92 168 80M199 109C194 98 203 92 198 80M229 109C224 98 233 92 228 80" stroke="#D5C5B0" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M69 79C75 70 86 70 92 79" stroke="#C6B19A" strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      )}

      {v === 'seed' && (
        <g>
          <rect width="400" height="300" fill="#E7E3D3" />
          <g transform="rotate(-5 200 150)">
            <rect x="91" y="54" width="218" height="192" rx="7" fill="#FAF6E9" />
            <rect x="105" y="69" width="190" height="162" rx="3" fill="none" stroke="#D0C5AC" strokeDasharray="3 5" />
            <path d="M200 190V148" stroke="#6E896F" strokeWidth="3" />
            <path d="M200 158C178 155 167 139 170 123C189 125 201 138 200 158Z" fill="#87A083" />
            <path d="M200 169C221 163 232 145 228 130C208 134 198 149 200 169Z" fill="#A1B397" />
            <path d="M180 115C187 105 196 101 200 97C204 101 213 105 220 115" stroke="#C6A276" strokeWidth="1.5" fill="none" />
            <text x="200" y="217" textAnchor="middle" fill="#8B7A64" fontSize="12" fontFamily="serif" letterSpacing="3">观心 · 种下一件心事</text>
          </g>
          <circle cx="69" cy="239" r="4" fill="#B9AB89" />
          <ellipse cx="326" cy="245" rx="6" ry="3" fill="#C9BA9B" transform="rotate(20 326 245)" />
          <path d="M322 73C331 63 343 64 351 73" stroke="#C9BA9B" strokeWidth="2" fill="none" opacity="0.7" />
        </g>
      )}

      {v === 'tote' && (
        <g>
          <rect width="400" height="300" fill="#EDE7DB" />
          <circle cx="200" cy="143" r="118" fill="#F7F2E7" />
          <path d="M135 108H265L281 252H119L135 108Z" fill="#F4EEDF" stroke="#CDBEA7" strokeWidth="2" />
          <path d="M167 107C167 77 181 56 200 56C219 56 233 77 233 107" stroke="#CDBEA7" strokeWidth="8" fill="none" />
          <path d="M200 141C181 116 151 147 176 168C187 177 200 188 200 188C200 188 213 177 224 168C249 147 219 116 200 141Z" fill="#5F7D6D" />
          <circle cx="200" cy="163" r="10" fill="#F4EEDF" />
          <circle cx="203" cy="160" r="4" fill="#5F7D6D" />
          <path d="M157 213H243" stroke="#D8CBB6" strokeWidth="2" />
          <path d="M172 224H228" stroke="#D8CBB6" strokeWidth="2" />
          <path d="M92 64C99 54 111 54 118 64" stroke="#CDBEA7" strokeWidth="2" fill="none" opacity="0.6" />
          <circle cx="317" cy="71" r="5" fill="#D9B7A2" opacity="0.6" />
        </g>
      )}

      {v === 'aroma' && (
        <g>
          <rect width="400" height="300" fill="#E3D8C8" />
          <rect y="213" width="400" height="87" fill="#C6AA89" />
          <circle cx="202" cy="123" r="106" fill="#F1E8D9" opacity="0.65" />
          <g transform="translate(147 97)">
            <rect x="24" y="4" width="58" height="20" rx="5" fill="#6E6254" />
            <path d="M22 36H84L91 124H15L22 36Z" fill="#A87852" />
            <rect x="36" y="65" width="35" height="27" rx="2" fill="#F1E5D0" />
            <text x="53" y="83" textAnchor="middle" fill="#7D6048" fontSize="10" fontFamily="serif">松间</text>
            <path d="M42 56C44 49 40 45 43 38M56 56C58 49 54 45 57 38M70 56C72 49 68 45 71 38" stroke="#C7AF90" strokeWidth="2" fill="none" opacity="0.65" />
          </g>
          <g transform="translate(244 150)">
            <rect x="12" y="39" width="55" height="43" rx="8" fill="#E8DBC7" />
            <path d="M18 49H61" stroke="#B79B7A" strokeWidth="1.5" />
            <path d="M39 35C35 28 39 24 37 18" stroke="#F4E9D4" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M39 16C34 12 34 6 39 2C44 6 44 12 39 16Z" fill="#EAC26A" />
          </g>
          <path d="M83 82C89 73 100 73 106 82" stroke="#BDA98C" strokeWidth="2" fill="none" opacity="0.55" />
          <circle cx="325" cy="89" r="8" fill="#DFC2A2" opacity="0.6" />
        </g>
      )}

      {v === 'draw' && (
        <g>
          <rect width="400" height="300" fill="#F0E1D4" />
          <circle cx="83" cy="56" r="75" fill="#F8EDE1" opacity="0.7" />
          <g transform="rotate(4 200 150)">
            <rect x="78" y="35" width="244" height="212" rx="8" fill="#FCF8EE" />
            <rect x="78" y="35" width="18" height="212" rx="8" fill="#E6D4C1" />
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M133 212C139 172 158 160 173 169C188 178 176 195 190 190C204 185 207 155 225 158C244 161 237 189 255 182C271 176 277 150 294 155C306 159 303 177 301 188" stroke="#D18B72" strokeWidth="5" />
              <path d="M139 122C159 99 183 98 204 114C218 125 235 121 248 108C260 97 275 99 285 112" stroke="#6E8B76" strokeWidth="4" />
              <circle cx="149" cy="154" r="8" fill="#EEC66F" stroke="none" />
              <path d="M259 208L271 201M265 215L277 208" stroke="#8B9EB0" strokeWidth="3" />
            </g>
          </g>
          <g transform="translate(299 203) rotate(38)">
            <rect x="0" y="0" width="94" height="13" rx="3" fill="#E4B86B" />
            <rect x="86" y="0" width="18" height="13" rx="3" fill="#D18B72" />
            <path d="M94 0L110 6.5L94 13V0Z" fill="#6A5849" />
          </g>
          <circle cx="335" cy="61" r="2.2" fill="#BF8D73" />
          <circle cx="353" cy="82" r="1.5" fill="#BF8D73" />
        </g>
      )}

      {v === 'turtle' && (
        <g>
          <rect width="400" height="300" fill="#DFE7DA" />
          <circle cx="105" cy="59" r="75" fill="#EDF1E6" opacity="0.8" />
          <rect x="70" y="204" width="260" height="10" rx="5" fill="#A88C6D" />
          <path d="M123 205C124 168 157 145 200 145C243 145 276 168 277 205H123Z" fill="#5D7867" />
          <path d="M111 204C111 177 147 167 200 167C253 167 289 177 289 204H111Z" fill="#7E9984" />
          <path d="M159 205C162 183 174 173 200 173C226 173 238 183 241 205" fill="none" stroke="#DDE7D5" strokeWidth="2.5" opacity="0.6" />
          <path d="M290 205C310 199 323 205 328 216" stroke="#6A8772" strokeWidth="11" fill="none" strokeLinecap="round" />
          <path d="M120 158C112 143 119 127 133 121C140 137 134 151 120 158Z" fill="#8FA78F" />
          <path d="M292 170C305 159 319 161 327 172C316 183 302 182 292 170Z" fill="#8FA78F" />
          <g stroke="#C7B79DB0" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M160 110C170 91 181 82 196 76" />
            <path d="M243 112C230 95 216 84 200 76" />
            <path d="M200 55V23" />
          </g>
          <ellipse cx="200" cy="70" rx="26" ry="18" fill="#E1C897" />
          <path d="M200 57L211 69L200 82L189 69Z" fill="#8D9A75" />
          <circle cx="167" cy="55" r="4" fill="#F3E9D5" opacity="0.65" />
          <circle cx="236" cy="40" r="6" fill="#F3E9D5" opacity="0.5" />
          <path d="M65 229C73 219 85 219 93 229" stroke="#B3A388" strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      )}

      {v === 'idiom' && (
        <g>
          <rect width="400" height="300" fill="#EDE2CE" />
          <circle cx="317" cy="75" r="84" fill="#F7EEDC" opacity="0.7" />
          <g transform="translate(77 48)">
            <path d="M0 18C0 8 8 0 18 0H92V64H47C47 74 38 82 29 82C19 82 11 74 11 64V64H18C8 64 0 56 0 46V18Z" fill="#7F9882" />
            <path d="M55 75H105C115 75 123 83 123 93V132H78C68 132 60 124 60 114V99H55V75Z" fill="#D28B71" />
            <path d="M137 33H227C237 33 245 41 245 51V91H182V128C182 138 174 146 164 146H137V104H123V63H137V33Z" fill="#E9C476" />
            <circle cx="60" cy="38" r="7" fill="#EDE2CE" opacity="0.6" />
            <circle cx="203" cy="61" r="7" fill="#EDE2CE" opacity="0.7" />
            <path d="M149 84L169 62L189 84M169 62V108" stroke="#8E7657" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <circle cx="74" cy="203" r="8" fill="#C9B491" opacity="0.55" />
          <circle cx="331" cy="218" r="12" fill="#D7C3A3" opacity="0.55" />
          <path d="M311 144C321 134 334 134 344 144" stroke="#B5A184" strokeWidth="2" fill="none" opacity="0.6" />
        </g>
      )}

      {v === 'song' && (
        <g>
          <rect width="400" height="300" fill="#DDE4E6" />
          <circle cx="199" cy="153" r="119" fill="#EDF3F2" opacity="0.8" />
          <path d="M100 178V141C100 83 143 52 200 52C257 52 300 83 300 141V178" stroke="#4E6E70" strokeWidth="19" fill="none" strokeLinecap="round" />
          <rect x="82" y="158" width="44" height="80" rx="21" fill="#6E918F" />
          <rect x="274" y="158" width="44" height="80" rx="21" fill="#6E918F" />
          <path d="M212 160V93L267 83V149" stroke="#C98A6D" strokeWidth="6" fill="none" strokeLinejoin="round" />
          <ellipse cx="199" cy="161" rx="17" ry="12" fill="#C98A6D" transform="rotate(-18 199 161)" />
          <ellipse cx="254" cy="150" rx="17" ry="12" fill="#C98A6D" transform="rotate(-18 254 150)" />
          <path d="M111 72C119 62 131 62 139 72" stroke="#A8BCBB" strokeWidth="2" fill="none" />
          <circle cx="316" cy="76" r="5" fill="#C98A6D" opacity="0.55" />
          <path d="M88 239C97 229 109 229 118 239" stroke="#A8BCBB" strokeWidth="2" fill="none" opacity="0.7" />
        </g>
      )}

      {v === 'karaoke' && (
        <g>
          <rect width="400" height="300" fill="#EADBDA" />
          <circle cx="201" cy="150" r="113" fill="#F5E8E4" />
          <g transform="translate(176 45) rotate(18)">
            <rect x="18" y="0" width="44" height="123" rx="22" fill="#4D6C64" />
            <rect x="23" y="8" width="34" height="104" rx="17" fill="#79938A" />
            <g stroke="#DCE8E1" strokeWidth="2" opacity="0.6">
              <path d="M31 22H49M31 34H49M31 46H49M31 58H49M31 70H49" />
            </g>
            <path d="M40 123H72V133C72 149 58 158 40 158C22 158 8 149 8 133V123H40Z" fill="#A9A29A" />
            <path d="M36 160H74V182C74 190 68 196 60 196H50C42 196 36 190 36 182V160Z" fill="#6C625B" />
          </g>
          <g fill="#D38F7C">
            <path d="M111 88C101 76 91 92 103 103C108 108 114 114 114 114C114 114 120 108 125 103C137 92 124 76 114 88" />
            <path d="M299 186C291 177 283 189 292 198C296 202 300 207 300 207C300 207 304 202 308 198C317 189 307 177 299 186" opacity="0.75" />
          </g>
          <g stroke="#D9AE68" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M112 154V199M112 154L135 148V184" />
          </g>
          <circle cx="107" cy="202" r="7" fill="#D9AE68" />
          <circle cx="130" cy="187" r="6" fill="#D9AE68" />
          <g fill="#CBB08A" opacity="0.7">
            <circle cx="313" cy="70" r="3" />
            <circle cx="74" cy="81" r="2" />
            <circle cx="329" cy="237" r="4" />
          </g>
        </g>
      )}

      {v === 'live' && (
        <g>
          <rect width="400" height="300" fill="#253E43" />
          <path d="M200 0L358 300H42L200 0Z" fill="#F6E6C2" opacity="0.12" />
          <path d="M200 0L272 300H128L200 0Z" fill="#F6E6C2" opacity="0.08" />
          <circle cx="200" cy="137" r="67" fill="#F1CD80" opacity="0.2" />
          <g transform="translate(200 135)">
            <rect x="-9" y="-38" width="18" height="66" rx="9" fill="#F6EBD6" />
            <path d="M-24 8C-24 34 24 34 24 8" stroke="#F6EBD6" strokeWidth="5" fill="none" />
            <path d="M0 34V50" stroke="#F6EBD6" strokeWidth="4" />
            <path d="M-16 52H16" stroke="#F6EBD6" strokeWidth="4" strokeLinecap="round" />
          </g>
          <g fill="#D58D78">
            <path d="M100 91C89 77 76 93 90 106C95 111 100 117 100 117C100 117 105 111 110 106C124 93 111 77 100 91Z" opacity="0.6" />
            <path d="M307 160C299 151 291 163 300 172C304 176 307 180 307 180C307 180 310 176 314 172C323 163 315 151 307 160Z" opacity="0.5" />
          </g>
          <g fill="#F2D79B">
            <circle cx="91" cy="49" r="2" />
            <circle cx="319" cy="82" r="1.6" />
            <circle cx="62" cy="183" r="1.4" />
            <circle cx="340" cy="227" r="2.3" />
          </g>
        </g>
      )}

      {!['window','flowers','mountain','forest','garden','sea','desk','dusk','night','sage','peach','spring','star','badge','cup','seed','tote','aroma','draw','turtle','idiom','song','karaoke','live'].includes(v) && (
        <g>
          <rect width="400" height="300" fill={`url(#${sky})`} />
          <circle cx="300" cy="72" r="48" fill="#F2C96D" />
          <path d="M0 216C86 168 157 208 226 204C298 200 342 166 400 182V300H0V216Z" fill="#8FA48E" />
          <path d="M0 253C90 225 155 251 235 245C315 239 355 227 400 236V300H0V253Z" fill="#5A7565" />
        </g>
      )}
    </svg>
  )
}
