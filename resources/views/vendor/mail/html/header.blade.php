@props(['url', 'banner' => null])

<tr>
    <td class="header" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="text-align: center; background-color: #cc3396; padding: 20px 0;">
        <a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
            <span style="
                font-family: 'Allura', cursive; 
                font-size: 20px; 
                color: #ffffff;
                letter-spacing: 1px;
            ">
                Ramil's Creation
            </span>
        </a>

        @if(!empty($banner))
            <div style="margin-top: 10px;">
                <img src="{{ $banner }}" alt="Notification Banner"
                     style="width: 100%; max-width: 570px;">
            </div>
        @endif
    </td>
</tr>
