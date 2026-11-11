<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_the_root_url_redirects_to_the_dashboard(): void
    {
        $this->actingAsSchoolMember()
            ->get('/')
            ->assertRedirect(route('dashboard'));
    }

    public function test_the_root_url_requires_login(): void
    {
        $this->get('/')->assertRedirect(route('login'));
    }
}
