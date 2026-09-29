import React, { useState, useEffect } from 'react';
import SmoothImage from '../../components/SmoothImage';
import PageHeader from '../../components/navigation/PageHeader';
import Icon from '../../components/AppIcon';
import ApplySheet from './components/ApplySheet';
import { readCache } from '../../utils/apiCache';
import { fetchVacancies } from '../../services/vacancies/vacanciesService';

const VacancyCard = ({ vacancy, onApply }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = (vacancy.description || '').length > 140;
  const details = [vacancy.employment, vacancy.experience].filter(Boolean);

  return (
    <article className="rounded-2xl border border-border p-5">
      <h3 className="font-display text-xl text-foreground leading-snug">{vacancy.title}</h3>

      {details.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {details.map((detail) => (
            <span key={detail} className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground/80">
              {detail}
            </span>
          ))}
        </div>
      )}

      {vacancy.description && (
        <>
          <p className={`text-sm text-muted-foreground leading-relaxed mt-3 whitespace-pre-line ${expanded ? '' : 'line-clamp-3'}`}>
            {vacancy.description}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-sm font-medium text-primary mt-1"
            >
              {expanded ? 'Свернуть' : 'Читать полностью'}
            </button>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => onApply(vacancy.title)}
        className="w-full h-12 mt-4 rounded-xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
      >
        Откликнуться
      </button>
    </article>
  );
};

const Team = () => {
  const [data, setData] = useState(() => readCache('vacancies'));
  const [loadFailed, setLoadFailed] = useState(false);
  const [applyFor, setApplyFor] = useState(null); // null = closed, '' = general application

  useEffect(() => {
    fetchVacancies()
      .then(setData)
      .catch((error) => {
        console.error('Failed to load vacancies:', error);
        setLoadFailed(true);
      });
  }, []);

  const vacancies = data?.vacancies || [];
  const isLoading = !data && !loadFailed;

  return (
    <div className="min-h-screen bg-background">
      <div className="main-content max-w-md mx-auto">
        <PageHeader title="Команда" subtitle="Работа в Benedict" />

        <section className="relative rounded-3xl overflow-hidden mb-8 bg-[#3a2f25]">
          <SmoothImage
            eager
            src="/branch-nukus.webp"
            alt="Зал Benedict с гостями"
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h2 className="font-display text-[26px] leading-tight text-white">
              Ищем людей, которые любят гостей
            </h2>
            <p className="text-sm text-white/80 mt-1.5">
              Два филиала в Ташкенте: Нукус и Мирабад
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl text-foreground">Вакансии</h2>
            {vacancies.length > 0 && (
              <span className="text-sm text-muted-foreground">{vacancies.length} открыто</span>
            )}
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-border p-5 animate-pulse">
                  <div className="h-5 w-2/3 bg-muted rounded-full" />
                  <div className="h-3 w-full bg-muted rounded-full mt-4" />
                  <div className="h-3 w-4/5 bg-muted rounded-full mt-2" />
                  <div className="h-12 w-full bg-muted rounded-xl mt-5" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && vacancies.length > 0 && (
            <div className="space-y-3">
              {vacancies.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} onApply={setApplyFor} />
              ))}
            </div>
          )}

          {!isLoading && vacancies.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center">
              <Icon name="Briefcase" size={28} className="mx-auto text-primary mb-3" />
              <p className="font-medium text-foreground">
                {loadFailed ? 'Не удалось загрузить вакансии' : 'Сейчас открытых вакансий нет'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Оставьте анкету — напишем, когда появится место
              </p>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl bg-muted/60 p-5">
          <h2 className="font-display text-xl text-foreground">Не нашли свою должность?</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Оставьте анкету, и мы свяжемся с вами, когда будет подходящее место.
          </p>
          <button
            type="button"
            onClick={() => setApplyFor('')}
            className="w-full h-12 rounded-xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon name="Send" size={18} />
            Оставить анкету
          </button>
        </section>
      </div>


      <ApplySheet
        isOpen={applyFor !== null}
        onClose={() => setApplyFor(null)}
        position={applyFor}
      />
    </div>
  );
};

export default Team;
