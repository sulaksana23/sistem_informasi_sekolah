<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['email' => 'guru@example.test']);

        $this->post(route('login.store'), ['email' => 'guru@example.test', 'password' => 'password'])
            ->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'guru@example.test']);

        $this->from(route('login'))
            ->post(route('login.store'), ['email' => 'guru@example.test', 'password' => 'salah'])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_registration_grants_no_school_and_ignores_role_input(): void
    {
        $this->post(route('register.store'), [
            'name' => 'Pengguna Baru', 'email' => 'baru@example.test',
            'password' => 'rahasia123', 'password_confirmation' => 'rahasia123', 'role' => 'admin',
        ])->assertRedirect(route('dashboard'));

        $user = User::query()->where('email', 'baru@example.test')->firstOrFail();
        $this->assertDatabaseMissing('school_memberships', ['user_id' => $user->id]);
        $this->get(route('dashboard'))->assertRedirect(route('tenant.no-school'));
    }

    public function test_user_can_logout(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('logout'))
            ->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_forgot_password_sends_link_without_revealing_unknown_email(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'guru@example.test']);

        $this->post(route('password.email'), ['email' => 'Guru@Example.test'])
            ->assertSessionHas('success');
        Notification::assertSentTo($user, ResetPassword::class);

        $this->post(route('password.email'), ['email' => 'tidak-ada@example.test'])
            ->assertSessionHas('success')
            ->assertSessionHasNoErrors();
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        $user = User::factory()->create(['email' => 'guru@example.test']);
        $token = Password::createToken($user);

        $this->get(route('password.reset', ['token' => $token, 'email' => $user->email]))->assertOk();

        $this->post(route('password.store'), [
            'token' => $token, 'email' => $user->email,
            'password' => 'sandibaru123', 'password_confirmation' => 'sandibaru123',
        ])->assertRedirect(route('login'));

        $this->assertTrue(Hash::check('sandibaru123', $user->fresh()->password));
    }

    public function test_password_reset_rejects_invalid_token(): void
    {
        $user = User::factory()->create(['email' => 'guru@example.test']);

        $this->post(route('password.store'), [
            'token' => 'token-palsu', 'email' => $user->email,
            'password' => 'sandibaru123', 'password_confirmation' => 'sandibaru123',
        ])->assertSessionHasErrors('email');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }
}
