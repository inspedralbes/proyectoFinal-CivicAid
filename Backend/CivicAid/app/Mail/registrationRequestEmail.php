<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Symfony\Component\Mime\Crypto\DkimSigner;
// C:\Users\Carlos\Desktop\proyectoFinal-CivicAid-1\Backend\CivicAid\vendor\symfony\mime\Crypto\DkimSigner.php
use Symfony\Component\Mime\Email;

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
        return $this->markdown('emails.registration.request')
            ->subject('Your Registration Request is Being Processed')
            ->with([
                'name' => $this->user->name,
            ]);

            // $this->withSymfonyMessage(function (Email $message) {
            //     $signer = new DkimSigner(config('mail.dkim_private_key'), config('mail.dkim_domain'),
            //     config('mail.dkim_selector'));
            //     $signer->sign($message);
            // });

            // return $this;
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
