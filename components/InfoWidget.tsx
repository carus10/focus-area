import React, { useState } from 'react';
import Icon from './Icon.tsx';
import { IconName } from '../types.ts';

interface InfoItem {
    icon: IconName;
    title: string;
    content: string;
}

const infoData: InfoItem[] = [
    {
        icon: 'BookOpen',
        title: 'Full-Focus Dashboard\'a Hoş Geldin!',
        content: 'Bu panel, Pomodoro tekniğini modern ve motive edici araçlarla birleştirerek verimliliğini en üst düzeye çıkarmak için tasarlandı. Odaklan, ödüller kazan ve kendini geliştirirken eğlen!'
    },
    {
        icon: 'Play',
        title: 'Pomodoro Zamanlayıcı & Akış Modu',
        content: 'Zamanlayıcı, klasik Pomodoro tekniğini kullanır: belirli bir süre odaklanma, ardından kısa bir mola. Ayarlardan süreleri kişiselleştirebilirsin. "Akış Modu" ise, odak seansın sırasında rastgele tetiklenerek sana +10 dakika hediye eden bir sürprizdir. Bu, derin konsantrasyonunu bozmadan devam etmeni sağlar.'
    },
    {
        icon: 'Star',
        title: 'Puan Sistemi: OP, Bilet ve Çark Hakları',
        content: 'Her odaklandığın dakika için 1 Odak Puanı (OP) kazanırsın. Seans sürene göre ödüller artar: 25dk+ seanslar 1 Bilet, 40dk+ seanslar 2 Bilet ve 1 Çark Hakkı, 90dk+ seanslar ise 6 Bilet ve 2 Çark Hakkı verir. OP\'leri kart almak, Biletleri kelime oyunu oynamak ve Çark Haklarını ödül çarkını çevirmek için kullanırsın.'
    },
    {
        icon: 'Gift',
        title: 'Koleksiyon: Başarılarını Sergile',
        content: 'Koleksiyon, başarılarını temsil eden dijital kartlardan oluşur. Kartların nadirlik seviyeleri vardır: Common, Rare, Epic, Legendary ve Icon. Çoğu kartı OP ile açabilirsin. Efsanevi (Legendary) kartlar için ise 10 odaklanma seansı (her biri en az 20dk) tamamlaman gerekir. Her 3 Efsanevi kart açtığında, en nadir seviye olan bir Icon kartı kazanma hakkı elde edersin!'
    },
    {
        icon: 'Wind',
        title: 'Yenilenme Alanı: Mola Vakti',
        content: 'Molalarını verimli ve eğlenceli geçir. "Kelime Bulmaca" oyununda biletlerinle OP kazanabilir, "Çarkıfelek"te çark haklarınla ekstra ödüller elde edebilirsin. Ayrıca, göz, nefes ve boyun egzersizleri ile fiziksel olarak da rahatlayabilirsin.'
    },
    {
        icon: 'CheckSquare',
        title: 'Görevler, Notlar ve Dersler',
        content: 'Günlük işlerini "Görevler" bölümünde takip et. Önemli bilgilerini klasörler halinde "Notlar" bölümünde düzenle. Online kurslarını veya derslerini ise "Dersler" bölümüne ekleyerek ilerlemeni kaydet. Her ders için özel notlar da alabilirsin.'
    },
    {
        icon: 'Music',
        title: 'Müzik Çalar & Motivasyon',
        content: 'Müzik Çalar, Internet Archive üzerindeki koleksiyonları çalabilir. Sevdiğin bir koleksiyonun URL\'sini yapıştırıp dinleyebilir ve daha sonra hızlıca erişmek için kaydedebilirsin. Dashboard\'daki "Motivasyon Panosu"na ise hedeflerini hatırlatacak bir resim yükleyerek ilham alabilirsin.'
    }
];

const InfoWidget: React.FC = () => {
    const [openItem, setOpenItem] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenItem(openItem === index ? null : index);
    };

    return (
        <div className="bg-light-card/60 dark:bg-dark-card/50 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/20 dark:border-white/10">
            <h2 className="text-xl font-bold mb-4">Uygulama Rehberi</h2>
            <div className="space-y-2">
                {infoData.map((item, index) => (
                    <div key={index} className="border-b border-white/10 last:border-b-0">
                        <button
                            onClick={() => handleToggle(index)}
                            className="w-full flex justify-between items-center text-left p-3 hover:bg-gray-500/10 rounded-lg transition-colors"
                        >
                            <div className="flex items-center">
                                <Icon name={item.icon} className="w-5 h-5 mr-3 text-primary" />
                                <span className="font-semibold">{item.title}</span>
                            </div>
                            <Icon 
                                name="ChevronDown" 
                                className={`w-5 h-5 transition-transform duration-300 ${openItem === index ? 'rotate-180' : ''}`} 
                            />
                        </button>
                        <div 
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openItem === index ? 'max-h-96' : 'max-h-0'}`}
                        >
                            <p className="p-3 pt-0 text-sm text-gray-600 dark:text-gray-300">
                                {item.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InfoWidget;