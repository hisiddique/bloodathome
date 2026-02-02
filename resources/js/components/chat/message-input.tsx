import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form } from '@inertiajs/react';
import { Send } from 'lucide-react';

export interface MessageInputProps {
    action: string;
    placeholder?: string;
    disabled?: boolean;
}

export function MessageInput({
    action,
    placeholder = 'Type your message...',
    disabled = false,
}: MessageInputProps) {
    return (
        <div className="border-t p-4">
            <Form
                action={action}
                method="post"
                resetOnSuccess
                options={{
                    preserveScroll: true,
                }}
                id="message-form"
            >
                {({ processing }) => (
                    <div className="flex gap-2">
                        <Input
                            name="content"
                            placeholder={placeholder}
                            required
                            disabled={processing || disabled}
                            autoComplete="off"
                        />
                        <Button
                            type="submit"
                            disabled={processing || disabled}
                            size="icon"
                        >
                            <Send className="size-4" />
                        </Button>
                    </div>
                )}
            </Form>
        </div>
    );
}
