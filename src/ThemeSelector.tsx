import { useTheme, PRESETS, ThemePreset } from './ThemeContext';
import { Check, Type, Palette, Layout } from 'lucide-react';

export const ThemeSelector = () => {
  const { currentTheme, setTheme, baseSize, setBaseSize } = useTheme();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 预设风格选择 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Palette className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">预设界面风格</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(PRESETS) as ThemePreset[]).map((id) => {
            const preset = PRESETS[id];
            const isActive = currentTheme.id === id;
            
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`group relative p-6 rounded-[32px] border transition-all duration-300 text-left overflow-hidden ${
                  isActive 
                  ? "bg-white/10 border-primary ring-1 ring-primary shadow-primary" 
                  : "bg-neutral-900/40 border-white/5 hover:border-white/20 hover:bg-neutral-900/60"
                }`}
              >
                {isActive && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center"
                    style={{ backgroundColor: preset.primary }}
                  >
                    <Layout className={`w-5 h-5 ${id === 'minimal' ? 'text-black' : 'text-white'}`} />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{preset.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{preset.id}</div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {preset.description}
                </p>
                
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-500 border border-white/5">
                    {preset.fontFamily.split(',')[0].replace(/"/g, '')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 细节微调 */}
      <section className="bg-neutral-900/40 border border-white/5 p-8 rounded-[40px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
            <Type className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">排版与大小</h3>
        </div>

        <div className="max-w-md space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">全局基准字号</label>
              <span className="text-primary font-mono font-bold text-lg">{baseSize}px</span>
            </div>
            <input 
              type="range" 
              min="14" 
              max="20" 
              step="1"
              value={baseSize}
              onChange={(e) => setBaseSize(parseInt(e.target.value))}
              className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-bold px-1">
              <span>小 (14px)</span>
              <span>默认</span>
              <span>大 (20px)</span>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
            <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-widest">实时预览预览文本</p>
            <p className="leading-relaxed" style={{ fontSize: `${baseSize}px` }}>
              彭艳：重新定义您的财务安全与传承。我们将为您提供最专业的保险方案。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
