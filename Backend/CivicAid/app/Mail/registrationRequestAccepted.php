<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class registrationRequestAccepted extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct($user)
    {
        $this->user = $user;
    }

    public function build()
    {
        return $this->markdown('emails.registration.requestAccepted')
            ->subject('Your Registration Request has been accepted')
            ->with([
                'name' => $this->user->name,
                'email' => $this->user->email,
                'password' => $this->user->password,
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
            subject: 'Registration Request Accepted',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.registration.requestAccepted',
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
