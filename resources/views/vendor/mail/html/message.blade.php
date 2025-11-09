<x-mail::layout>
{{-- Header --}}
<x-slot:header>
<x-mail::header :url="config('app.url')">
{{ config('app.name') }}
</x-mail::header>
</x-slot:header>

{{-- Body --}}
{!! $slot !!}

{{-- Subcopy --}}
@isset($subcopy)
<x-slot:subcopy>
<x-mail::subcopy>
{!! $subcopy !!}
</x-mail::subcopy>
</x-slot:subcopy>
@endisset

{{-- Footer --}}
<x-slot:footer>
    <table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation"
           style="background-color: #cc3396;">
        <tr>
            <td class="content-cell" align="center"  style="padding: 20px;">
                <div style="color: #ffffff; font-size: 13px;">
                    © {{ date('Y') }} <strong>Ramil’s Creation</strong>. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</x-slot:footer>
</x-mail::layout>
