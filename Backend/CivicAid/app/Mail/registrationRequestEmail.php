<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
// use Symfony\Component\Mime\Email;

class registrationRequestEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    public function __construct($user)
    {
        $this->user = $user;
    }

    public function build()
    {
        try {
            return $this->markdown('emails.registration.request')
                ->subject('Your Registration Request is Being Processed')
                ->with([
                    'name' => $this->user->name,
                ]);
        } catch (\Throwable $th) {
            // Logueamos el error
            Log::error('Error al construir el correo electrónico de solicitud de registro: ' . $th->getMessage());
            
            // Aquí puedes manejar el error de otra manera, como enviar un email de error a un administrador o registrar el error en algún servicio de monitoreo.
            
            // Devolvemos una instancia de Mailable vacía en caso de error
            return new self([]);
        }

        // try {
        //     return $this->markdown('emails.registration.request')
        //         ->subject('Your Registration Request is Being Processed')
        //         ->with([
        //             'name' => $this->user->name,
        //         ]);
        // } catch (\Throwable $th) {
        //     // Logueamos el error
        //     Log::error('Error al construir el correo electrónico de solicitud de registro: ' . $th->getMessage());
            
        //     // Respondemos con un mensaje de error genérico
        //     // return $this->markdown('emails.error');
        //     // return response($th);
        //     return response(`DA ERROR EN MAIL`, $this->user->email);

        // }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Registration Request Email',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.registration.request',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
