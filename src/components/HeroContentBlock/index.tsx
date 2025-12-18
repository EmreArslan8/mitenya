// components/HeroContentBlock/index.tsx
import React, { useRef, useEffect, useState, FC } from 'react';
import { componentStyles } from './styles'; 

interface HeroContentBlockProps {}

const HeroContentBlock: FC<HeroContentBlockProps> = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false); 

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]: IntersectionObserverEntry[]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (sectionRef.current) {
                        observer.unobserve(sectionRef.current);
                    }
                }
            },
            {
                threshold: 0.1,
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    // 1. TÜM BÖLÜM İÇİN SCROLL ANIMASYONU (Aşağıdan yukarıya gelme)
    const animatedSectionStyle: React.CSSProperties = {
        ...componentStyles.sectionBase,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
    };

    // 2. GÖRSEL SÜTUNU İÇİN CANLANMA ANIMASYONU (Yakınlaşma ve Opaklık)
    const imageAnimationStyle: React.CSSProperties = {
        ...componentStyles.imageColumn,
        // Görünür olduğunda opacity 1, başlangıçta 0.5
        opacity: isVisible ? 1 : 0.5,
        // Görünür olduğunda scale 1 (normal boyut), başlangıçta 1.05 (hafif büyük)
        transform: isVisible ? 'scale(1)' : 'scale(1.05)',
        // Geçiş süresi (ana animasyondan biraz daha uzun ve gecikmeli)
        transition: 'opacity 1.2s ease-out 0.2s, transform 1.2s ease-out 0.2s',
    };

    // 3. Buton Hover Stili
    const buttonStyle: React.CSSProperties = {
        ...componentStyles.button,
        // styles.ts içinde hover desteği olmadığı için dinamik olarak yönetiyoruz
        backgroundColor: isHovered ? componentStyles.button.borderColor : 'transparent',
        color: isHovered ? componentStyles.sectionBase.backgroundColor : componentStyles.button.color,
    };

    return (
        <section
            ref={sectionRef} 
            style={animatedSectionStyle} 
        >
            <div style={componentStyles.container}>
                <div style={componentStyles.contentColumn}>
                    <h3 style={componentStyles.subHeading}>TIPS AND TRICKS</h3>
                    <h2 style={componentStyles.mainHeading}>Health &amp; Beauty Hub</h2>
                    <p style={componentStyles.text}>
                        Find out the latest skincare tips, ingredient trends &amp;
                        exclusive information on our unique product range.
                    </p>
                    <a 
                        href="#" 
                        style={buttonStyle} 
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        Latest Articles
                    </a>
                </div>
                
                {/* ARKA PLAN RESMİNİN UYGULANDIĞI ALAN */}
                <div style={imageAnimationStyle}>
                    {/* Görsel artık arka plan olduğu için bu div içi boş kalır. */}
                </div>
            </div>
        </section>
    );
};

export default HeroContentBlock;