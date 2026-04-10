// Daftar sumber berita (total 17 sumber)
const sources = [
  // SUMBER LAMA (9)
  { 
    name: 'cnbc', 
    url: 'https://api.siputzx.my.id/api/berita/cnbcindonesia', 
    map: i => ({ 
      title: i.title || '', 
      link: i.link || '#', 
      image: i.image || i.thumbnail || null, 
      cat: i.label || 'CNBC', 
      time: i.label || '', 
      src: 'cnbc' 
    }) 
  },
  { 
    name: 'tribun', 
    url: 'https://api.siputzx.my.id/api/berita/tribunnews', 
    map: i => ({ 
      title: i.title || '', 
      link: i.link || '#', 
      image: i.image_thumbnail || i.image || null, 
      cat: i.channel || 'Tribun', 
      time: i.time || '', 
      src: 'tribun' 
    }) 
  },
  { 
    name: 'cnn', 
    url: 'https://api.siputzx.my.id/api/berita/cnn', 
    map: i => ({ 
      title: i.title || '', 
      link: i.link || '#', 
      image: i.image_thumbnail || i.image || null, 
      cat: 'CNN', 
      time: i.time || '', 
      src: 'cnn', 
      content: i.content || '' 
    }) 
  },
  { 
    name: 'kompas', 
    url: 'https://api.siputzx.my.id/api/berita/kompas', 
    map: i => ({ 
      title: i.title || '', 
      link: i.link || '#', 
      image: i.image || i.thumbnail || null, 
      cat: i.category || 'Kompas', 
      time: i.date || '', 
      src: 'kompas' 
    }) 
  },
  { 
    name: 'sindonews', 
    url: 'https://api.siputzx.my.id/api/berita/sindonews', 
    map: i => ({ 
      title: i.title || '', 
      link: i.link || '#', 
      image: i.imageUrl || i.image || null, 
      cat: i.category || 'Sindonews', 
      time: i.timestamp || '', 
      src: 'sindonews' 
    }) 
  },
  { 
    name: 'suara', 
    url: 'https://api.siputzx.my.id/api/berita/suara', 
    map: i => ({ 
      title: i.title || '', 
      link: i.link || '#', 
      image: i.image || i.thumbnail || null, 
      cat: i.label || 'Suara.com', 
      time: i.pubDate || '', 
      src: 'suara' 
    }) 
  },
  { 
    name: 'liputan6', 
    url: 'https://api.siputzx.my.id/api/berita/liputan6', 
    map: i => ({ 
      title: i.title || '', 
      link: i.link || '#', 
      image: i.image || i.thumbnail || i.images || i.cover || i.picture || i.img || null, 
      cat: i.label || i.category || 'Liputan6', 
      time: i.pubDate || i.date || i.timestamp || '', 
      src: 'liputan6' 
    }) 
  },
  { 
    name: 'merdeka', 
    url: 'https://api.siputzx.my.id/api/berita/merdeka', 
    map: i => ({ 
      title: i.title || '', 
      link: i.link || '#', 
      image: i.image || i.thumbnail || null, 
      cat: i.label || 'Merdeka', 
      time: i.pubDate || '', 
      src: 'merdeka' 
    }) 
  },
  { 
    name: 'antara', 
    url: 'https://api.siputzx.my.id/api/berita/antara', 
    map: i => ({ 
      title: i.title || '', 
      link: i.link || '#', 
      image: i.image || null, 
      cat: i.category || 'Antara', 
      time: i.timestamp || '', 
      src: 'antara' 
    }) 
  },
  
  // SUMBER GEMPA DAN LIBUR (domain baru: api.raicong.my.id)
  { 
    name: 'gempa', 
    url: 'https://apii.raicong.my.id/api/berita/gempa', 
    map: (item, index, allData) => {
      const results = [];
      if (allData?.auto?.Infogempa?.gempa) {
        const g = allData.auto.Infogempa.gempa;
        results.push({
          title: `🔴 GEMPA: ${g.Magnitude} SR - ${g.Wilayah}`,
          link: '#',
          image: null,
          cat: 'Gempa Terkini',
          time: g.Tanggal + ' ' + g.Jam,
          src: 'gempa',
          badge: 'GEMPA',
          magnitude: g.Magnitude,
          kedalaman: g.Kedalaman,
          wilayah: g.Wilayah,
          dirasakan: g.Dirasakan
        });
      }
      if (allData?.terkini?.Infogempa?.gempa) {
        allData.terkini.Infogempa.gempa.slice(0, 5).forEach(g => {
          results.push({
            title: `🌍 Gempa: ${g.Magnitude} SR - ${g.Wilayah}`,
            link: '#',
            image: null,
            cat: 'Gempa',
            time: g.Tanggal + ' ' + g.Jam,
            src: 'gempa',
            badge: 'GEMPA',
            magnitude: g.Magnitude,
            kedalaman: g.Kedalaman,
            wilayah: g.Wilayah,
            potensi: g.Potensi
          });
        });
      }
      if (allData?.dirasakan?.Infogempa?.gempa) {
        allData.dirasakan.Infogempa.gempa.slice(0, 3).forEach(g => {
          results.push({
            title: `📢 Gempa Dirasakan: ${g.Magnitude} SR - ${g.Wilayah}`,
            link: '#',
            image: null,
            cat: 'Gempa Dirasakan',
            time: g.Tanggal + ' ' + g.Jam,
            src: 'gempa',
            badge: 'GEMPA',
            magnitude: g.Magnitude,
            kedalaman: g.Kedalaman,
            wilayah: g.Wilayah,
            dirasakan: g.Dirasakan
          });
        });
      }
      return results;
    },
    isMultiItem: true
  },
  { 
    name: 'harilibur', 
    url: 'https://apii.raicong.my.id/api/berita/harilibur', 
    map: (item, index, allData) => {
      const results = [];
      if (!allData?.data) return results;
      
      // Hari ini
      if (allData.hari_ini?.tanggal) {
        results.push({
          title: `📅 Hari Ini: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}`,
          link: '#',
          image: null,
          cat: 'Kalender',
          time: allData.hari_ini.tanggal,
          src: 'harilibur',
          badge: 'HARI LIBUR'
        });
      }
      
      // Event nasional mendatang
      if (allData.mendatang?.event_nasional) {
        allData.mendatang.event_nasional.slice(0, 5).forEach(e => {
          results.push({
            title: `📅 ${e.event} (${e.daysUntil} hari lagi)`,
            link: '#',
            image: null,
            cat: 'Hari Nasional',
            time: e.date,
            src: 'harilibur',
            badge: 'HARI LIBUR',
            daysUntil: e.daysUntil
          });
        });
      }
      
      // Hari libur mendatang
      if (allData.mendatang?.hari_libur) {
        allData.mendatang.hari_libur.forEach(e => {
          results.push({
            title: `🎉 ${e.event} (${e.daysUntil} hari lagi)`,
            link: '#',
            image: null,
            cat: 'Hari Libur',
            time: e.date,
            src: 'harilibur',
            badge: 'HARI LIBUR',
            daysUntil: e.daysUntil
          });
        });
      }
      return results;
    },
    isMultiItem: true
  },
  
  // SUMBER BARU DARI RAICONG (6)
  { 
    name: 'medcom', 
    url: 'https://apii.raicong.my.id/api/berita/medcom', 
    map: i => ({ 
      title: i.title || 'Medcom', 
      link: i.link || '#', 
      image: i.thumbnail || null, 
      cat: 'Medcom', 
      time: '', 
      src: 'medcom' 
    }) 
  },
  { 
    name: 'viva', 
    url: 'https://apii.raicong.my.id/api/berita/viva', 
    map: i => ({ 
      title: i.title || 'Viva', 
      link: i.link || '#', 
      image: i.thumbnail || null, 
      cat: 'Viva', 
      time: '', 
      src: 'viva' 
    }) 
  },
  { 
    name: 'jawapos', 
    url: 'https://apii.raicong.my.id/api/berita/jawapos', 
    map: i => ({ 
      title: i.title || 'Jawa Pos', 
      link: i.link || '#', 
      image: i.thumbnail || null, 
      cat: 'Jawa Pos', 
      time: '', 
      src: 'jawapos' 
    }) 
  },
  { 
    name: 'republika', 
    url: 'https://apii.raicong.my.id/api/berita/republika', 
    map: i => ({ 
      title: i.title || 'Republika', 
      link: i.link || '#', 
      image: i.thumbnail || null, 
      cat: 'Republika', 
      time: '', 
      src: 'republika' 
    }) 
  }
];
