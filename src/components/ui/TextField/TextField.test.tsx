import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from './index';

/**
 * ADR-0002 Faz 3 / F3.1 — `TextField`'ın asıl işi erişilebilirlik bağlarını
 * kurmak. Bu test o bağların varlığını çiviliyor: mevcut `FormikTextField`
 * bunları KURMUYORDU (bkz. bileşen başındaki not).
 */
describe('ui/TextField', () => {
  it('etiketi girdiye bağlar (etikete tıklayınca odaklanır)', async () => {
    const user = userEvent.setup();
    render(<TextField label="E-posta adresi" name="email" />);

    const input = screen.getByLabelText('E-posta adresi');
    expect(input).toBeInTheDocument();

    await user.click(screen.getByText('E-posta adresi'));
    expect(input).toHaveFocus();
  });

  it('hata durumunda aria-invalid ve aria-describedby kurar', () => {
    render(<TextField label="E-posta" name="email" error="Geçersiz e-posta" />);

    const input = screen.getByLabelText('E-posta');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    const messageId = input.getAttribute('aria-describedby');
    expect(messageId).toBeTruthy();
    expect(document.getElementById(messageId!)).toHaveTextContent('Geçersiz e-posta');
  });

  it('hata metni role="alert" ile duyurulur', () => {
    render(<TextField label="Şifre" error="Şifre zorunludur" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Şifre zorunludur');
  });

  it('hata yokken yardım metni describedby ile bağlanır ama alert değildir', () => {
    render(<TextField label="Şifre" helperText="En az 8 karakter" />);

    const input = screen.getByLabelText('Şifre');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(document.getElementById(input.getAttribute('aria-describedby')!)).toHaveTextContent(
      'En az 8 karakter',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('autoComplete, type ve inputMode aynen geçer (otomatik doldurma)', () => {
    render(
      <TextField label="Telefon" type="tel" autoComplete="tel" inputMode="tel" name="phone" />,
    );
    const input = screen.getByLabelText('Telefon');
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('autocomplete', 'tel');
    expect(input).toHaveAttribute('inputmode', 'tel');
  });

  it('yazma olayı iletilir', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TextField label="Ad" onChange={onChange} value="" />);

    await user.type(screen.getByLabelText('Ad'), 'a');
    expect(onChange).toHaveBeenCalled();
  });
});
