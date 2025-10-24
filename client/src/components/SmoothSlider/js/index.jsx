import EmblaCarousel from './EmblaCarousel';
import '../css/base.css';
import '../css/sandbox.css';
import '../css/embla.css';

const LOOP = true;

const SmoothSlider = ({ value, onChange }) => (
  <main className='sandbox'>
    <section className='sandbox__carousel'>
      <EmblaCarousel loop={LOOP} value={value} onChange={onChange} />
    </section>
  </main>
);

export default SmoothSlider;
