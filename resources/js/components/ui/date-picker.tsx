import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subYears, isValid } from 'date-fns';
import { usePage } from '@inertiajs/react';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    maxDate?: Date;
    minDate?: Date;
    placeholder?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    /** "dob" enables dropdown navigation with a 100-year range up to today.
     *  "dob-adult" same as "dob" but caps at 18 years ago. */
    variant?: 'default' | 'dob' | 'dob-adult';
}

interface FormatConfig {
    mask: string;
    separator: string;
    separatorPositions: number[];
    digitToMaskPositions: number[];
    parseOrder: { day: number; month: number; year: number };
    formatFn: string;
}

/** Get format configuration based on the system date format setting */
function getFormatConfig(formatSetting: string): FormatConfig {
    switch (formatSetting) {
        case 'MM/DD/YYYY':
            return {
                mask: 'MM/DD/YYYY',
                separator: '/',
                separatorPositions: [2, 5],
                digitToMaskPositions: [0, 1, 3, 4, 6, 7, 8, 9],
                parseOrder: { month: 0, day: 1, year: 2 },
                formatFn: 'MM/dd/yyyy',
            };
        case 'YYYY-MM-DD':
            return {
                mask: 'YYYY-MM-DD',
                separator: '-',
                separatorPositions: [4, 7],
                digitToMaskPositions: [0, 1, 2, 3, 5, 6, 8, 9],
                parseOrder: { year: 0, month: 1, day: 2 },
                formatFn: 'yyyy-MM-dd',
            };
        case 'DD/MM/YYYY':
        default:
            return {
                mask: 'DD/MM/YYYY',
                separator: '/',
                separatorPositions: [2, 5],
                digitToMaskPositions: [0, 1, 3, 4, 6, 7, 8, 9],
                parseOrder: { day: 0, month: 1, year: 2 },
                formatFn: 'dd/MM/yyyy',
            };
    }
}

/** Build the display string: overlay typed digits on the mask template */
function buildDisplay(digits: string, config: FormatConfig): string {
    const chars = config.mask.split('');
    for (let i = 0; i < digits.length && i < 8; i++) {
        chars[config.digitToMaskPositions[i]] = digits[i];
    }
    return chars.join('');
}

/** Get cursor position in the display string for a given digit count */
function cursorForDigitCount(count: number, config: FormatConfig): number {
    if (count === 0) return 0;
    return config.digitToMaskPositions[count - 1] + 1;
}

/** Parse a complete display string into a Date */
function parseDisplay(display: string, config: FormatConfig): Date | undefined {
    const escapedSeparator = config.separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^(\\d{2,4})${escapedSeparator}(\\d{2})${escapedSeparator}(\\d{2,4})$`);
    const match = display.match(pattern);
    if (!match) return undefined;

    const [, part1, part2, part3] = match;
    const parts = [part1, part2, part3];

    const dd = Number(parts[config.parseOrder.day]);
    const mm = Number(parts[config.parseOrder.month]);
    const yyyy = Number(parts[config.parseOrder.year]);

    const date = new Date(yyyy, mm - 1, dd);
    if (
        date.getDate() !== dd ||
        date.getMonth() !== mm - 1 ||
        date.getFullYear() !== yyyy
    ) {
        return undefined;
    }
    return isValid(date) ? date : undefined;
}

export function DatePicker({
    name,
    value,
    defaultValue,
    onChange,
    maxDate,
    minDate,
    placeholder,
    id,
    disabled,
    required,
    className,
    variant = 'default',
}: DatePickerProps) {
    const { settings } = usePage().props as { settings: { date_format: string } };
    const formatConfig = React.useMemo(() => getFormatConfig(settings.date_format), [settings.date_format]);
    const resolvedPlaceholder = placeholder ?? formatConfig.mask;

    const isDob = variant === 'dob' || variant === 'dob-adult';
    const resolvedMaxDate = maxDate ?? (variant === 'dob-adult' ? subYears(new Date(), 18) : variant === 'dob' ? new Date() : undefined);
    const resolvedMinDate = minDate ?? (isDob ? subYears(new Date(), 100) : undefined);

    const parseInitial = (dateString?: string) => {
        if (!dateString) return undefined;
        return new Date(dateString + 'T00:00:00');
    };

    const isControlled = value !== undefined;
    const initialDate = parseInitial(isControlled ? value : defaultValue);
    const getDigitsFromDate = (date: Date | undefined) => {
        if (!date) return '';
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = String(date.getFullYear());

        switch (settings.date_format) {
            case 'MM/DD/YYYY':
                return mm + dd + yyyy;
            case 'YYYY-MM-DD':
                return yyyy + mm + dd;
            case 'DD/MM/YYYY':
            default:
                return dd + mm + yyyy;
        }
    };

    const initialDigits = getDigitsFromDate(initialDate);

    const [digits, setDigits] = React.useState(initialDigits);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(initialDate);
    const [open, setOpen] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const displayValue = digits.length > 0 ? buildDisplay(digits, formatConfig) : '';

    React.useEffect(() => {
        if (isControlled) {
            const date = parseInitial(value);
            setSelectedDate(date);
            setDigits(getDigitsFromDate(date));
        }
    }, [value, isControlled]);

    const setCursorPosition = (pos: number) => {
        requestAnimationFrame(() => {
            inputRef.current?.setSelectionRange(pos, pos);
        });
    };

    const applyDate = (date: Date): boolean => {
        if (resolvedMaxDate && date > resolvedMaxDate) {
            setError(variant === 'dob-adult'
                ? 'You must be at least 18 years old.'
                : 'Date is too far in the future.');
            setSelectedDate(undefined);
            return false;
        }
        if (resolvedMinDate && date < resolvedMinDate) {
            setError('Date is too far in the past.');
            setSelectedDate(undefined);
            return false;
        }

        setError(null);
        setSelectedDate(date);
        setDigits(getDigitsFromDate(date));

        if (onChange) {
            onChange(format(date, 'yyyy-MM-dd'));
        }
        return true;
    };

    const handleCalendarSelect = (date: Date | undefined) => {
        if (!date) return;
        applyDate(date);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Tab' || e.key === 'Escape') return;

        // Prevent default for everything — we handle all input manually
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (digits.length > 0) {
                const newDigits = digits.slice(0, -1);
                setDigits(newDigits);
                setError(null);
                setSelectedDate(undefined);
                setCursorPosition(cursorForDigitCount(newDigits.length, formatConfig));
            }
            return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
            return; // allow navigation
        }

        e.preventDefault();

        // Only accept digits
        if (!/^\d$/.test(e.key)) return;
        if (digits.length >= 8) return;

        const newDigits = digits + e.key;
        setDigits(newDigits);
        setError(null);
        setCursorPosition(cursorForDigitCount(newDigits.length, formatConfig));

        // Validate when all 8 digits entered
        if (newDigits.length === 8) {
            const display = buildDisplay(newDigits, formatConfig);
            const parsed = parseDisplay(display, formatConfig);
            if (parsed) {
                applyDate(parsed);
            } else {
                setError('Invalid date.');
                setSelectedDate(undefined);
            }
        } else {
            setSelectedDate(undefined);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
        if (!pasted) return;

        setDigits(pasted);
        setError(null);
        setCursorPosition(cursorForDigitCount(pasted.length, formatConfig));

        if (pasted.length === 8) {
            const display = buildDisplay(pasted, formatConfig);
            const parsed = parseDisplay(display, formatConfig);
            if (parsed) {
                applyDate(parsed);
            } else {
                setError('Invalid date.');
                setSelectedDate(undefined);
            }
        } else {
            setSelectedDate(undefined);
        }
    };

    const handleFocus = () => {
        setOpen(true);
        setCursorPosition(cursorForDigitCount(digits.length, formatConfig));
    };

    const handleBlur = () => {
        if (digits.length > 0 && digits.length < 8) {
            setError(`Please enter a complete date (${formatConfig.mask}).`);
        }
    };

    // Prevent onChange from doing anything — all input is via onKeyDown
    const handleChange = () => {};

    const disabledDates: { after?: Date; before?: Date } = {};
    if (resolvedMaxDate) disabledDates.after = resolvedMaxDate;
    if (resolvedMinDate) disabledDates.before = resolvedMinDate;

    const hiddenValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

    return (
        <div>
            <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={resolvedPlaceholder}
                    disabled={disabled}
                    autoComplete="off"
                    className={cn(
                        'w-full pl-12 pr-12 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary',
                        disabled && 'cursor-not-allowed opacity-50',
                        className,
                    )}
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            disabled={disabled}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Open calendar"
                        >
                            <CalendarIcon className="h-5 w-5" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleCalendarSelect}
                            disabled={disabledDates}
                            defaultMonth={selectedDate ?? (isDob ? new Date(2000, 0) : resolvedMaxDate)}
                            {...(isDob && {
                                captionLayout: 'dropdown',
                                startMonth: resolvedMinDate,
                                endMonth: resolvedMaxDate,
                            })}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={hiddenValue}
                    required={required}
                />
            )}
        </div>
    );
}
