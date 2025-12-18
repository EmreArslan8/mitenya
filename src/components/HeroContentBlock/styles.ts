// components/HeroContentBlock/styles.ts

import React from 'react';

const colors = {
    primaryGreen: '#384d35',
    white: '#ffffff',
};

// Arka plan görselinin özellikleri
const backgroundImageStyle: React.CSSProperties = {
    // Görseli public klasöründen alıyoruz
    backgroundImage: "url('/static/images/banner.webp')", 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
};

export const componentStyles: { [key: string]: React.CSSProperties } = {
    // SECTION Genel Stilleri (Animasyon stilleri index.tsx'te yönetilecek)
    sectionBase: {
        width: '100%',
        backgroundColor: colors.primaryGreen,
        padding: '80px 0',
        marginBottom: '50px',
    },

    // Container ve Sütun Stilleri
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '40px',
    },
    contentColumn: {
        flex: 1,
        maxWidth: '50%',
        color: colors.white,
    },
    
    // GÖRSEL SÜTUNU STİLLERİ (Arka plan görseli burada tanımlanıyor)
    imageColumn: {
        flex: 1,
        maxWidth: '50%',
        minHeight: '450px', // Yüksekliği sabitliyoruz ki arka plan görünsün
        ...backgroundImageStyle, // Arka plan görsel özelliklerini ekle
        
        // Bu stiller başlangıç animasyonu için index.tsx'te dinamik olarak üzerine yazılacaktır.
    },

    // Tipografi Stilleri
    subHeading: {
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '10px',
    },
    mainHeading: {
        fontSize: '48px',
        marginBottom: '20px',
        lineHeight: 1.1,
    },
    text: {
        fontSize: '18px',
        marginBottom: '30px',
        lineHeight: 1.5,
    },

    // Buton Stilleri
    button: {
        display: 'inline-block',
        padding: '12px 30px',
        border: `2px solid ${colors.white}`,
        color: colors.white,
        textDecoration: 'none',
        fontWeight: 600,
        transition: 'background-color 0.3s, color 0.3s',
        cursor: 'pointer',
    },
    // Not: Mobil uyumluluk (media queries) ve hover efektleri 
    // geleneksel JS/TS nesnelerinde yönetilemez.
};